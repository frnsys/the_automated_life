import json
import yaml
import random
import numpy as np
import pandas as pd
import networkx as nx
from tqdm import tqdm
from collections import defaultdict

jobs = {}
skills = {}

MIN_SKILLS = 7
MIN_SKILL_WEIGHT = 1.5

data = pd.read_csv('data/src/job_industries.csv')
industries = {}
for i, r in data.iterrows():
    inds = r['cleanedIndustry']
    if not isinstance(inds, str): continue
    if not isinstance(r['Code'], str): continue

    inds = inds.replace('\'', '"')
    id, _ = r['Code'].split('.')
    industries[id] = [i.strip() for i in json.loads(inds)]

# Job node positions for network layout
job_network_layout = {}
data = json.load(open('data/src/jobNetwork.json'))
for job in data['nodes']:
    job_network_layout[job['id']] = {
        'x': job['x'],
        'y': job['y']
    }

# Center the layout
max_x = max(job_network_layout.values(), key=lambda pt: pt['x'])['x']
max_y = max(job_network_layout.values(), key=lambda pt: pt['y'])['y']
min_x = min(job_network_layout.values(), key=lambda pt: pt['x'])['x']
min_y = min(job_network_layout.values(), key=lambda pt: pt['y'])['y']
x_offset = (max_x - min_x)/2 + min_x
y_offset = (max_y - min_y)/2 + min_y
for pt in job_network_layout.values():
    pt['x'] -= x_offset
    pt['y'] -= y_offset

# Job mean wages
wages = pd.read_csv('data/src/job_wages.csv')
wages = {r[' Job Title']: r['A_MEAN'] for _, r in wages.iterrows()}

# Industry->jobs lookup
industries_jobs = defaultdict(list)

# Job-skill matrix
df = pd.read_csv('data/src/jobSkillRcaMat.csv', delimiter='\t')
skills = {i: name.strip() for i, name in enumerate(df.columns.tolist()[2:])}
n_jobs = len(df)
for i, r in tqdm(df.iterrows()):
    id = r['Job Code']
    name = r[' Job Title'].strip()
    vals = r.tolist()[2:]

    # Get job skills above minimum weight
    job_skills = {}
    for j, v in enumerate(vals):
        if v >= MIN_SKILL_WEIGHT: job_skills[j] = v

    # Default to no industries
    inds = industries.get(id, [])

    # Try to get required data
    # if some is absent, skip this job
    try:
        job_network_layout[id]
        wage = wages[name]
    except KeyError:
        print('skipping:', id, r[' Job Title'])
        continue

    # Save data
    idx = len(jobs)
    jobs[idx] = {
        'id': idx,
        'name': name,
        'wage': wage,
        'skills': job_skills,
        'pos': job_network_layout[id],
        'industries': inds
    }
    for ind in inds:
        industries_jobs[ind].append(idx)
    assert len(job_skills) >= MIN_SKILLS

# Inverse indices for lookups
jobs_inv = {j['name']: i for i, j in jobs.items()}
skills_inv = {name: i for i, name in skills.items()}

# Skill-skill similarity
skill_skill = pd.read_csv('data/src/skillSkill.csv', delimiter='\t')
skill_sim = defaultdict(dict)
for i, r in tqdm(skill_skill.iterrows()):
    a = skills_inv[r['Skill 1']]
    b = skills_inv[r['Skill 2']]
    keys = sorted([a, b])
    skill_sim[keys[0]][keys[1]] = r['Weight']

# Job-job similarity (for job network)
df = pd.read_csv('data/src/jobJobSkillSims.tsv', delimiter='\t')
job_job = np.zeros((n_jobs, n_jobs))
for i, r in tqdm(df.iterrows()):
    try:
        a = jobs_inv[r['Title 1']]
        b = jobs_inv[r['Title 2']]
        job_job[a][b] = job_job[b][a] = r['Skill Sim']
    except KeyError:
        # skipped job
        continue

# Build the job network edges
min_neighbors = 1 # min so that the graph is connected
min_similarity = 0.7
for idx, job in jobs.items():
    min_sim = min_similarity
    cands = np.argsort(job_job[idx])
    similar = [id for id in cands if job_job[idx][id] >= min_sim]

    # if no similar, incrementally reduce minimum similarity
    # until we get at least one
    while len(similar) < min_neighbors:
        min_sim -= 0.05
        similar = [id for id in cands if job_job[idx][id] >= min_sim]
        similar = list(set(similar))
    job['similar'] = [int(id) for id in similar]

# Skill-automation exposure
df = pd.read_csv('data/src/orderedOnetSkillsByComputerization.csv')
automatibility = {}
for row in tqdm(df.itertuples()):
    i = skills_inv[row.Skill]

    # Convert from [-1, 1] to [0, 1]
    auto = (row.correlation + 1)/2

    skills[i] = {
        'id': i,
        'name': row.Skill,
        'automatibility': auto,

        # TODO
        'price': random.randint(1000, 10000)
    }

# Create job graph
G = nx.Graph()
for id, job in jobs.items():
    for id_ in job['similar']:
        G.add_edge(int(id), int(id_))

# Ensure the graph is connected
while not nx.is_connected(G):
    components = sorted(nx.connected_components(G), key=lambda c: len(c), reverse=True)

    # Biggest component is the primary one
    primary = components.pop(0)
    component = components[0]
    most_similar = None
    for node in component:
        other = max(primary, key=lambda n: job_job[node][n])
        sim = job_job[node][other]
        if most_similar is None or sim > most_similar[-1]:
            most_similar = (node, other, sim)
    G.add_edge(most_similar[0], most_similar[1])

if not nx.is_connected(G):
    raise Exception('Graph should be fully connected. Try increasing min_neighbors')

# Robot release schedules/scenarios
scenarios = yaml.load(open('data/src/robotSchedules.yml'))
for scenario in scenarios:
    for i, robot in enumerate(scenario['schedule']):
        robot['id'] = i

        # convert to skill ids
        robot['skills'] = [skills_inv[s] for s in robot['skills']]

with open('data/scenarios.json', 'w') as f:
    json.dump(scenarios, f)

with open('data/jobs.json', 'w') as f:
    json.dump(jobs, f)

with open('data/skills.json', 'w') as f:
    json.dump(skills, f)

with open('data/skillSims.json', 'w') as f:
    json.dump(skill_sim, f)

with open('data/industries.json', 'w') as f:
    json.dump(industries_jobs, f)