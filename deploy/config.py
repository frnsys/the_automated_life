import os
SENTRY_DSN = os.environ['FOW_SENTRY_DSN']
REDIS = {
    'host': os.environ['FOW_REDIS_HOST'],
    'port': 6379,
    'db': 1,
    'password': os.environ['FOW_REDIS_PASS'] or None
}
AUTH_KEY = os.environ['FOW_AUTH_KEY']

SQLALCHEMY_DATABASE_URI = os.environ['FOW_PSQL_URI']
SQLALCHEMY_TRACK_MODIFICATIONS = False

EU_COUNTRIES = [
    'EU', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'GF', 'GP', 'MQ', 'ME', 'YT', 'RE', 'MF', 'GI', 'AX', 'PM', 'GL', 'BL', 'SX', 'AW', 'CW', 'WF', 'PF', 'NC', 'TF', 'AI', 'BM', 'IO', 'VG', 'KY', 'FK', 'MS', 'PN', 'SH', 'GS', 'TC', 'AD', 'LI', 'MC', 'SM', 'VA', 'JE', 'GG', 'GI', 'CH'
]