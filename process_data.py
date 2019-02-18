import json
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

# Job-skill matrix
df = pd.read_csv('data/src/jobSkillRcaMat.csv', delimiter='\t')
n_jobs = len(df)
n_skills = []
skills = {i: name.strip() for i, name in enumerate(df.columns.tolist()[2:])}
skill_weights = []
for i, r in tqdm(df.iterrows()):
    vals = r.tolist()[2:]
    job_skills = {}
    for j, v in enumerate(vals):
        skill_weights.append(v)
        if v >= MIN_SKILL_WEIGHT: job_skills[j] = v
    id = r['Job Code']
    name = r[' Job Title'].strip()
    try:
        job_network_layout[id]
        wage = wages[name]
    except KeyError:
        print('skipping:', id, r[' Job Title'])
        continue
    idx = len(jobs)
    jobs[idx] = {
        'name': name,
        'wage': wage,
        'skills': job_skills,
        'pos': job_network_layout[id]
    }
    n_skills.append(len(job_skills))
    # print('n skills:', len(job_skills))
    assert len(job_skills) >= MIN_SKILLS
print('Mean skills:', np.mean(n_skills))
# print('Mean skill weight:', np.mean(skill_weights))
# print('Min skill weight:', np.min(skill_weights))
# print('Max skill weight:', np.max(skill_weights))
# print('Percentile skill weight:', np.percentile(skill_weights, 80))

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

# Job-job similarity
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

with open('data/jobs.json', 'w') as f:
    json.dump(jobs, f)

with open('data/skills.json', 'w') as f:
    json.dump(skills, f)

with open('data/skillSims.json', 'w') as f:
    json.dump(skill_sim, f)