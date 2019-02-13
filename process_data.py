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
MIN_SKILL_WEIGHT = 1.0

# Job-skill matrix
df = pd.read_csv('data/src/jobSkillRcaMat.csv', delimiter='\t')
n_jobs = len(df)
n_skills = []
skills = {i: name.strip() for i, name in enumerate(df.columns.tolist()[2:])}
for i, r in tqdm(df.iterrows()):
    vals = r.tolist()[2:]
    job_skills = {}
    for j, v in enumerate(vals):
        if v >= MIN_SKILL_WEIGHT: job_skills[j] = v
    jobs[i] = {
        'name': r[' Job Title'].strip(),
        'skills': job_skills
    }
    n_skills.append(len(job_skills))
    # print('n skills:', len(job_skills))
    assert len(job_skills) >= MIN_SKILLS
print('Mean skills:', np.mean(n_skills))

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
    a = jobs_inv[r['Title 1']]
    b = jobs_inv[r['Title 2']]
    job_job[a][b] = job_job[b][a] = r['Skill Sim']

max_neighbors = 6
min_neighbors = 3 # min so that the graph is connected
min_similarity = 0.6
for idx, job in jobs.items():
    min_sim = min_similarity
    cands = np.argsort(job_job[idx])[-max_neighbors:]
    similar = [id for id in cands if job_job[idx][id] >= min_sim]

    # if no similar, incrementally reduce minimum similarity
    # until we get at least one
    while len(similar) < min_neighbors:
        min_sim -= 0.05
        similar = [id for id in cands if job_job[idx][id] >= min_sim]
        similar = list(set(similar))
    job['similar'] = [int(id) for id in similar]

    # TODO
    job['wage'] = random.randint(0, 100)

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

if not nx.is_connected(G):
    raise Exception('Graph should be fully connected. Try increasing min_neighbors')

# Compute positions of job nodes
positions = nx.spring_layout(G, k=0.1)
nodes = [{'id': id, 'position': pos.tolist()} for id, pos in positions.items()]
with open('data/nodes.json', 'w') as f:
    json.dump(nodes, f)

with open('data/jobs.json', 'w') as f:
    json.dump(jobs, f)

with open('data/skills.json', 'w') as f:
    json.dump(skills, f)

with open('data/skillSims.json', 'w') as f:
    json.dump(skill_sim, f)