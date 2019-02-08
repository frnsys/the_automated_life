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
job_skill = np.zeros((n_jobs, len(skills)))
for i, r in tqdm(df.iterrows()):
    jobs[i] = r[' Job Title'].strip()
    vals = r.tolist()[2:]
    for j, v in enumerate(vals):
        job_skill[i][j] = v
print('Job-Skill:', job_skill.shape)

jobs_inv = {name: i for i, name in jobs.items()}
skills_inv = {name: i for i, name in skills.items()}

# Job-job similarity
df = pd.read_csv('data/src/jobJobSkillSims.tsv', delimiter='\t')
job_job = np.zeros((n_jobs, n_jobs))
for i, r in tqdm(df.iterrows()):
    a = jobs_inv[r['Title 1']]
    b = jobs_inv[r['Title 2']]
    job_job[a][b] = job_job[b][a] = r['Skill Sim']
print('Job-Job:', job_job.shape)

# Skill-automation exposure
df = pd.read_csv('data/src/orderedOnetSkillsByComputerization.csv')
automatibility = {}
for row in tqdm(df.itertuples()):
    i = skills_inv[row.Skill]
    skills[i] = {
        'name': row.Skill,
        'automatibility': row.correlation
    }

with open('data/jobs.json', 'w') as f:
    json.dump({
        'idx': jobs,
        'job_skill': job_skill.tolist(),
        'job_job': job_job.tolist(),
    }, f)

with open('data/skills.json', 'w') as f:
    json.dump(skills, f)