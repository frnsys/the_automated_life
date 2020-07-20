import json
import pandas as pd

LANGS = ['ar', 'de', 'es', 'fr', 'zh']
for lang in LANGS:
    with open('../static/lang/{}.json'.format(lang), 'r') as f:
        translations = json.load(f)

    changes = 0
    csv = pd.read_csv('translations/updates/{}.csv'.format(lang))
    original_col = csv.columns[1]
    correction_col = csv.columns[-1]
    for i, row in csv.iterrows():
        if isinstance(row[correction_col], str):
            original = row[original_col]
            translations[original] = row[correction_col]
            changes += 1
    print(lang, changes)

    with open('../static/lang/{}.json'.format(lang), 'w') as f:
        json.dump(translations, f, sort_keys=True, indent=4)