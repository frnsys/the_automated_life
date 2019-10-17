import json
from app import app
from datastore import Meta, Log, Summary

if __name__ == '__main__':
    with app.app_context():
        logs = Log.query.all()
        metas = Meta.query.all()
        summaries = Summary.query.all()

    logs = [{
        'id': l.id,
        'session': l.session,
        'timestamp': l.timestamp,
        'data': json.loads(l.data)
    } for l in logs]

    summaries = [{
        'id': l.id,
        'session': l.session,
        'timestamp': l.timestamp,
        'data': json.loads(l.data)
    } for l in summaries]

    metas = [{
        'session': m.session,
        'ip_hash': m.ip_hash,
        'lat_lng': [m.lat, m.lng],
        'city': m.city,
        'state': m.state,
        'country': m.country
    } for m in metas]

    with open('logs.json', 'w') as f:
        json.dump({
            'logs': logs,
            'summaries': summaries,
            'metas': metas
        }, f)
