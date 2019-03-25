import json

jobs = json.load(open('data/jobs.json'))
jobs_by_risk = sorted(jobs.items(), key=lambda kv: kv[1]['automationRisk'], reverse=True)

top_n = 10
for id, job in jobs_by_risk[:top_n]:
    print(id, '::', job['name'], '::', job['automationRisk'])

import ipdb; ipdb.set_trace()
