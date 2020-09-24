import json
import math
import numpy as np
import pandas as pd
import networkx as nx
from tqdm import tqdm
from collections import defaultdict

jobs = {}
skills = {}

MIN_SKILLS = 7
MIN_SKILL_WEIGHT = 1.5

# Increase this to further space out nodes
# in the job network (e.g. to reduce overlaps)
NETWORK_SCALE = 2.5

omit = [l.strip() for l in open('../data/src/omitSkills.txt', 'r').readlines()]
skill_edits = pd.read_csv('../data/src/Clean Skills - orderedOnetSkillsByComputerization.csv')
omitted_skills = skill_edits[skill_edits['Omit?'] == 1.0]['Skill'].tolist() + omit
renamed_skills = skill_edits[skill_edits['Omit?'] != 1.0][['Skill', 'Short name']].dropna()
renamed_skills = dict(zip(renamed_skills['Skill'], renamed_skills['Short name']))

data = pd.read_csv('../data/src/job_industries.csv')
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
data = json.load(open('../data/src/jobNetwork.json'))
for job in data['nodes']:
    job_network_layout[job['id']] = {
        'x': job['x'] * NETWORK_SCALE,
        'y': job['y'] * NETWORK_SCALE
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

# Education levels
education_levels = defaultdict(dict)
df = pd.read_csv('../data/src/Education, Training, and Experience.tsv', delimiter='\t')
df = df.loc[df['Element Name'] =='Required Level of Education']
for i, r in df.iterrows():
    id = r['O*NET-SOC Code']
    id = id[:-3]
    education_levels[id][r['Category']] = r['Data Value']
education_levels = dict(education_levels)

# Collapse 3-6 education levels
for key, levels in education_levels.items():
    levels_list = [levels[1], levels[2]]
    levels_list.append(sum(levels[i] for i in range(3, 7)))
    for i in range(7,13):
        levels_list.append(levels[i])
    education_levels[key] = levels_list
    assert math.isclose(sum(levels_list), 100, abs_tol=1e-1)

# Job mean wages
wages = pd.read_csv('../data/src/job_wages.csv')
wages = {r[' Job Title']: r['A_MEAN'] for _, r in wages.iterrows()}

# Industry->jobs lookup
industries_jobs = defaultdict(list)

# Job-skill matrix
df = pd.read_csv('../data/src/jobSkillRcaMat.csv', delimiter='\t')
skills = {i: name.strip() for i, name in enumerate(df.columns.tolist()[2:])}
skills_inv = {name: i for i, name in skills.items()}
omitted_skills = [skills_inv[name] for name in omitted_skills]

# Skill groupings
skill_groups_df = pd.read_csv('../data/src/onet_content_model_reference.tsv', delimiter='\t')
skill_groups = {}
for i, row in skill_groups_df.iterrows():
    id = row['Element ID'].split('.')
    # if id[0] != '1': continue
    if len(id) == 3:
        skill_groups[row['Element ID']] = {
            'name': row['Element Name'],
            'skills': []
        }
    elif len(id) > 3:
        skill_name = row['Element Name']
        skill_id = skills_inv.get(skill_name)
        if skill_id is None or skill_id in omitted_skills:
            continue
        group_id = '.'.join(id[:3])
        skill_groups[group_id]['skills'].append(skill_id)
skill_groups = {id: g for id, g in skill_groups.items() if g['skills']}

# Job satisfaction measures
satisfactions = defaultdict(list)
for i, typ in enumerate([
    'Achievement',
    'Independence',
    'Recognition',
    'Relationships',
    'Support',
    'Working_Conditions']):
    sts = pd.read_csv('../data/src/satisfaction/{}.csv'.format(typ))
    for id in sts['O*NET-SOC Code']:
        id = id[:-3]
        satisfactions[id].append(i)

# Fraction of cognitive labor
# Use 2016 data
cog_fraction = pd.read_csv('../data/src/cogSkillFractionByOccupationByYear.csv', index_col='SOC')

# Normalize
cfs = cog_fraction['2016']
cog_fraction['2016'] = (cfs - cfs.min())/(cfs.max() - cfs.min())
cog_mean = cog_fraction['2016'].mean()

cognitive = {}
for id, r in cog_fraction.iterrows():
    cognitive[id] = r['2016']

cog_patterns = [
    (0.85, [1,0,2,1]),
    (0.70, [1,0,1,0]),
    (0.55, [0,1,0,1]),
    (0.35, [0,0,1,1]),
    (0.25, [0,0,0,1]),
    (0.00, [0,0,0,0]),
]

n_jobs = len(df)
job_onet_id_to_id = {}
for i, r in tqdm(df.iterrows()):
    id = r['Job Code']
    name = r[' Job Title'].strip()
    vals = r.tolist()[2:]

    # Get job skills above minimum weight
    job_skills = {}
    for s_id, v in enumerate(vals):
        if s_id in omitted_skills: continue
        if v >= MIN_SKILL_WEIGHT: job_skills[s_id] = v

    # Default to no industries
    inds = industries.get(id, [])

    # Try to get required data
    # if some is absent, skip this job
    try:
        job_network_layout[id]
        wage = wages[name]
        ed_levels = education_levels[id]
        cog_level = cognitive.get(id, cog_mean)
    except KeyError:
        print('skipping:', id, r[' Job Title'])
        continue

    pattern = next(pat for frac, pat in cog_patterns if cog_level >= frac)

    # Save data
    idx = len(jobs)
    jobs[idx] = {
        'id': idx,
        'name': name,
        'wage': wage,
        'skills': job_skills,
        'pos': job_network_layout[id],
        'industries': inds,
        'education': ed_levels,
        'satisfaction': list(set(satisfactions[id])),
        'cognitive': cog_level,
        'pattern': pattern
    }
    for ind in inds:
        industries_jobs[ind].append(idx)

    job_onet_id_to_id[id] = idx
    assert len(job_skills) >= MIN_SKILLS

# Inverse indices for lookups
jobs_inv = {j['name']: i for i, j in jobs.items()}
jobs_industries = {}
for ind, job_ids in industries_jobs.items():
    for id in job_ids:
        jobs_industries[id] = ind

# Skill-skill similarity
skill_skill = pd.read_csv('../data/src/skillSkill.csv', delimiter='\t')
skill_sim = defaultdict(dict)
for i, r in tqdm(skill_skill.iterrows()):
    a = skills_inv[r['Skill 1']]
    b = skills_inv[r['Skill 2']]
    keys = sorted([a, b])
    skill_sim[keys[0]][keys[1]] = r['Weight']

# Job-job similarity (for job network)
df = pd.read_csv('../data/src/jobJobSkillSims.tsv', delimiter='\t')
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
min_neighbors = 3 # min so that the graph is connected
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
df = pd.read_csv('../data/src/WebbBySkill_Regr.csv')
automatibility = {}
for row in tqdm(df.itertuples()):
    i = skills_inv[row.skill]

    # Average of different scores,
    # normalize later
    auto = (row.ai_score + row.software_score + row.robot_score)/3

    name = row.skill
    name = renamed_skills.get(name, name)

    skills[i] = {
        'id': i,
        'name': name,
        'automatibility': auto
    }

# Normalize to [0, 1]
auto_min = min(s['automatibility'] for s in skills.values())
auto_max = max(s['automatibility'] for s in skills.values())
for i, skill in skills.items():
    skill['automatibility'] -= auto_min
    skill['automatibility'] /= auto_max - auto_min

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

# Education level names
education_ref = json.load(open('../data/src/education.json'))
education = []
df = pd.read_csv('../data/src/Education, Training, and Experience Categories.csv')
df = df.loc[df['Element Name'] =='Required Level of Education']
for i, r in df.iterrows():
    # Collapse 3-6 into one cateogry
    if (i+1) == 3:
        education.append({
            'name': 'Secondary Degree',
            'years': -1, # specified elsewhere
            'cost': education_ref['Secondary Degree']['annualCost']
        })
    elif (i+1) in [4,5,6]:
        continue
    else:
        desc = r['Category Description']
        desc = desc.split(' - ')[0]
        desc = desc.split('(')[0]
        desc = desc.strip()
        education.append({
            'name': desc,
            'years': education_ref[desc]['years'],
            'cost': education_ref[desc]['annualCost']
        })

program_years = {
    'More than 4 years': 6,
    'Less than one year': 0.5,
    'At least two but less than four years': 3,
    'At least one but less than two years': 1.5,
    '4 years': 4,
    '2 years': 2
}
secondary_programs = defaultdict(list)
programs_df = pd.read_csv('../data/src/job_lengths.csv')
for i, r in programs_df.iterrows():
    job_id = job_onet_id_to_id.get(r.job)
    if job_id is None:
        print('Skipping', r.job)
        continue
    ind = jobs_industries.get(job_id)
    if ind is None:
        continue
    secondary_programs[ind].append({
        'name': r.course_name,
        'job': job_id,
        'years': program_years[r.length]
    })


# Shorter job names
names = pd.read_csv('../data/src/job_names.csv')
for j in jobs.values():
    short_name = names[names.name == j['name']].short_name.values[0]
    j['name'] = short_name.title()

# Compute automation risk for jobs
for j in jobs.values():
    automatibility = 0
    for s_id, weight in j['skills'].items():
        automatibility += skills[s_id]['automatibility'] * weight
    automatibility /= sum(j['skills'].values())
    j['automationRisk'] = automatibility

# Normalize
z = max(j['automationRisk'] for j in jobs.values())
for j in jobs.values():
    j['automationRisk'] /= z

with open('../data/education.json', 'w') as f:
    json.dump(education, f)

with open('../data/programs.json', 'w') as f:
    json.dump(secondary_programs, f)

with open('../data/jobs.json', 'w') as f:
    json.dump(jobs, f)

with open('../data/skills.json', 'w') as f:
    json.dump(skills, f)

with open('../data/skillGroups.json', 'w') as f:
    json.dump(list(skill_groups.values()), f)

with open('../data/skillSims.json', 'w') as f:
    json.dump(skill_sim, f)

with open('../data/industries.json', 'w') as f:
    json.dump(industries_jobs, f)