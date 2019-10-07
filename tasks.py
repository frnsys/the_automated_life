import json
import redis
import config
import sentry_sdk
from flask import Flask
from celery import Celery
from celery.schedules import crontab
from collections import defaultdict
from datastore import db, get_summaries

sentry_sdk.init(
    dsn=config.SENTRY_DSN,
)

app = Flask(__name__)
app.config.from_object(config)
db.init_app(app)

CELERY_BROKER_URL = 'amqp://guest:guest@localhost:5672//'
CELERY_RESULT_BACKEND = None
CELERYBEAT_SCHEDULE = {
    'aggregate_statistics': {
        'task': 'tasks.aggregate_statistics',
        'schedule': crontab(minute=0, hour=0),
    }
}

redis = redis.Redis(**config.REDIS)
celery = Celery('tasks', backend=CELERY_RESULT_BACKEND, broker=CELERY_BROKER_URL)
celery.conf.beat_schedule = CELERYBEAT_SCHEDULE

@celery.task
def aggregate_statistics():
    # Load summaries
    with app.app_context():
        summaries = get_summaries()
    aggs = defaultdict(lambda: defaultdict(int))
    for data in summaries:
        aggs['n_jobs']['sum'] += len(data['jobs'])
        aggs['n_jobs']['total'] += 1
        aggs['wins']['sum'] += int(data['success'])
        aggs['wins']['total'] += 1
        aggs['n_applied']['sum'] += data['nApplied']
        aggs['n_applied']['total'] += 1
        aggs['n_rejected']['sum'] += data['nRejected']
        aggs['n_rejected']['total'] += 1
        aggs['loans']['sum'] += data['loans']
        aggs['loans']['total'] += 1

    for stat in list(aggs.keys()):
        aggs[stat] = aggs[stat]['sum']/aggs[stat]['total']

    # Compute aggregate stats
    res = redis.set('fow:aggregate', json.dumps(aggs))
    return aggs
