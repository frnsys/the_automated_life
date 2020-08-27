import json
import pandas as pd

LANGS = ['ar', 'de', 'es', 'fr', 'zh']
EMOJI_FIXES = [
    ('üéÇ', '🎂'),
    ('üè', '🏦'),
    ('üí∏', '💸'),
    ('üéì', '🎓'),
    ('üõ†Ô∏è', '🛠️'),
    ('ü§ñ', '🤖'),
    ('üåé', '🌎'),
    ('üè¶', '🏦'),
    ('üèñÔ∏è', '🏖️')
]

def fix_emoji(v):
    for a, b in EMOJI_FIXES:
        v = v.replace(a, b)
    return v

ref = pd.read_csv('translation.csv').drop_duplicates(subset=['value'])
for lang in LANGS:
    df = pd.read_csv('translations/src/{}_ui.csv'.format(lang),
            header=None, names=['key', 'value'], index_col='key')
    data = {k: fix_emoji(v) for k, v in df['value'].to_dict().items()}

    df = pd.read_csv('translations/src/{}_misc.csv'.format(lang),
            header=None, names=['key', 'value'], index_col='key')
    for i, row in enumerate(ref.itertuples()):
        data[row.value] = df.loc[i]['value']

    with open('../static/lang/{}.json'.format(lang), 'w') as f:
        json.dump(data, f, sort_keys=True, indent=4)

    translations = data

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


df = pd.read_csv('translations/src/tutorial.csv')
TRANS = {lang: {} for lang in LANGS}
for i, row in df.iterrows():
    key = row['key']
    for lang in LANGS:
        trans = row['{} corrections'.format(lang)]
        TRANS[lang][key] = trans

for lang in LANGS:
    with open('../static/lang/{}.json'.format(lang), 'r') as f:
        translations = json.load(f)

    for key, trans in TRANS[lang].items():
        translations[key] = trans

    with open('../static/lang/{}.json'.format(lang), 'w') as f:
        json.dump(translations, f, sort_keys=True, indent=4)