"""
Fetch player logs from Redis
"""

import json
import redis
import config

redis = redis.Redis(**config.REDIS)

logs = {}
ids = [r.decode('utf8') for r in redis.keys('fow:*')]
for id in ids:
    log = [json.loads(r.decode('utf8')) for r in redis.lrange(id, 0, -1)]
    id = id.replace('fow:', '')
    logs[id] = log

with open('data/logs.json', 'w') as f:
    json.dump(logs, f)
