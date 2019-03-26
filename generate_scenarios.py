import json
import string
import random
import pandas as pd

def bot_name():
    return '{}{}-{}'.format(
        random.choice(string.ascii_uppercase),
        random.choice('aeiouy'),
        ''.join(random.choice(string.digits) for _ in range(4)))

automation_schedule = pd.read_csv('data/src/orderedOnetSkillsByComputerization.csv')
automation_schedule = automation_schedule.iloc[::-1]

skill_edits = pd.read_csv('data/src/Clean Skills - orderedOnetSkillsByComputerization.csv')
omitted_skills = skill_edits[skill_edits['Omit?'] == 1.0]['Skill'].tolist()
renamed_skills = skill_edits[skill_edits['Omit?'] != 1.0][['Skill', 'Short name']].dropna()
renamed_skills = dict(zip(renamed_skills['Skill'], renamed_skills['Short name']))

skills = json.load(open('data/skills.json'))
skills_idx = {s['name']: s['id'] for s in skills.values()}

start_month = 10
n_scenarios = 2
scenarios = []
for i in range(n_scenarios):
    schedule = []
    month = start_month
    for j, row in automation_schedule.iterrows():
        skill = row.Skill
        if skill in omitted_skills: continue
        skill = renamed_skills.get(skill, skill)
        month += random.randint(4,12)
        schedule.append({
            'id': j,
            'months': month,
            'name': bot_name(),
            'skills': [skills_idx[skill]],
            'deepeningCountdown': random.randint(2*12, 25*12),
            'efficiency': random.random()
        })

    scenario = {
        'name': 'Scenario {}'.format(i),
        'schedule': schedule
    }
    scenarios.append(scenario)

with open('data/src/scenarios.json', 'w') as f:
    json.dump(scenarios, f, sort_keys=True, indent=2)
with open('data/scenarios.json', 'w') as f:
    json.dump(scenarios, f, sort_keys=True, indent=2)
