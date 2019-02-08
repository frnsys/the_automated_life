import json
import numpy as np
import pandas as pd
from tqdm import tqdm

jobs = {}
skills = {}

# Job-skill matrix
df = pd.read_csv('data/src/jobSkillRcaMat.csv', delimiter='\t')
n_jobs = len(df)
skills = {i: name.strip() for i, name in enumerate(df.columns.tolist()[2:])}
for i, r in tqdm(df.iterrows()):
    vals = r.tolist()[2:]
    job_skills = {}
    for j, v in enumerate(vals):
        if v > 0: job_skills[j] = v
    jobs[i] = {
        'name': r[' Job Title'].strip(),
        'skills': job_skills
    }

jobs_inv = {j['name']: i for i, j in jobs.items()}
skills_inv = {name: i for i, name in skills.items()}

# Job-job similarity
df = pd.read_csv('data/src/jobJobSkillSims.tsv', delimiter='\t')
job_job = np.zeros((n_jobs, n_jobs))
for i, r in tqdm(df.iterrows()):
    a = jobs_inv[r['Title 1']]
    b = jobs_inv[r['Title 2']]
    job_job[a][b] = job_job[b][a] = r['Skill Sim']

# Skill-automation exposure
df = pd.read_csv('data/src/orderedOnetSkillsByComputerization.csv')
automatibility = {}
for row in tqdm(df.itertuples()):
    i = skills_inv[row.Skill]

    # Convert from [-1, 1] to [0, 1]
    auto = (row.correlation + 1)/2

    skills[i] = {
        'name': row.Skill,
        'automatibility': auto
    }

with open('data/jobs.json', 'w') as f:
    json.dump({
        'jobs': jobs,
        'job_job': job_job.tolist(),
    }, f)

with open('data/skills.json', 'w') as f:
    json.dump(skills, f)