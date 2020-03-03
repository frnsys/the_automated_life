import os
import json
import pandas as pd

def load(fname):
    path = os.path.join('../data/{}'.format(fname))
    return json.load(open(path, 'r'))

to_translate = []

fname = 'education.json'
for d in load(fname):
    to_translate.append({
        'file': fname,
        'key': 'name',
        'value': d['name']
    })

fname = 'industries.json'
for d in load(fname).keys():
    to_translate.append({
        'file': fname,
        'key': 'KEY',
        'value': d
    })

fname = 'jobs.json'
for d in load(fname).values():
    to_translate.append({
        'file': fname,
        'key': 'name',
        'value': d['name']
    })

fname = 'programs.json'
for k, d in load(fname).items():
    to_translate.append({
        'file': fname,
        'key': 'KEY',
        'value': k
    })
    for v in d:
        to_translate.append({
            'file': fname,
            'key': 'name',
            'value': v['name']
        })

fname = 'scenarios.json'
for d in load(fname):
    for v in d['schedule']:
        to_translate.append({
            'file': fname,
            'key': 'news.headline',
            'value': v['news']['headline']
        })
        to_translate.append({
            'file': fname,
            'key': 'news.body',
            'value': v['news']['body']
        })

fname = 'skillGroups.json'
for d in load(fname):
    to_translate.append({
        'file': fname,
        'key': 'name',
        'value': d['name']
    })

fname = 'skills.json'
for d in load(fname).values():
    to_translate.append({
        'file': fname,
        'key': 'name',
        'value': d['name']
    })

df = pd.DataFrame.from_records(to_translate)
df.to_csv('translation.csv')