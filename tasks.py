import json
import redis
import config
import sentry_sdk
from celery import Celery
from celery.schedules import crontab
from collections import defaultdict

sentry_sdk.init(
    dsn=config.SENTRY_DSN,
)

CELERY_BROKER_URL = 'amqp://guest:guest@localhost:5672//'
CELERY_RESULT_BACKEND = None
CELERYBEAT_SCHEDULE = {
    'aggregate_statistics': {
        'task': 'tasks.aggregate_statistics',
        'schedule': crontab(minute=0, hour=0),
    }
}

redis = redis.Redis(host='localhost', port=6379, db=1)
celery = Celery('tasks', backend=CELERY_RESULT_BACKEND, broker=CELERY_BROKER_URL)
celery.conf.beat_schedule = CELERYBEAT_SCHEDULE

@celery.task
def aggregate_statistics():
    # Load summaries
    keys = [r.decode('utf8') for r in redis.keys('fow:*:summary')]
    aggs = defaultdict(defaultdict(int))
    for k in keys:
        res = redis.get(k)
        data = json.loads(res)
        aggs['n_jobs']['sum'] += len(data['jobs'])
        aggs['n_jobs']['total'] += 1
        aggs['wins']['sum'] += int(data['success'])
        aggs['wins']['total'] += 1
        aggs['n_applied']['sum'] += len(data['nApplied'])
        aggs['n_applied']['total'] += 1
        aggs['n_rejected']['sum'] += len(data['nRejected'])
        aggs['n_rejected']['total'] += 1

    # Compute aggregate stats
    res = redis.set('fow:aggregate', json.dumps(aggs))
    redis.save()
