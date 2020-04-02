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