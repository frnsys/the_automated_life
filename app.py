import json
import redis
import config
import hashlib
import geocoder
from datastore import db, get_meta, save_meta, append_log, get_logs, save_summary, get_summary, get_summaries, Meta, Log, Summary
from collections import defaultdict
from flask import Flask, request, jsonify, render_template, abort
from sentry_sdk.integrations.flask import FlaskIntegration
import sentry_sdk

sentry_sdk.init(
    dsn=config.SENTRY_DSN,
    integrations=[FlaskIntegration()]
)

app = Flask(__name__)
app.config.from_object(config)
db.init_app(app)
redis = redis.Redis(**config.REDIS)
with app.app_context():
    db.configure_mappers()
    db.create_all()

def aggregate_statistics():
    # Load summaries
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
    redis.set('fow:aggregate', json.dumps(aggs))
    return aggs

@app.route('/')
def game():
    """Render the game page"""
    return render_template('index.html')

@app.route('/gdpr')
def gdpr():
    ip = request.environ['REMOTE_ADDR']
    loc = geocoder.ipinfo(ip)
    return jsonify(gdpr=loc.country in config.EU_COUNTRIES)

@app.route('/log', methods=['POST'])
def log():
    """Receive log messages from player clients"""
    data = request.get_json()
    id = data['id']
    del data['id']
    if not get_meta(id):
        ip = request.environ['REMOTE_ADDR']
        loc = geocoder.ipinfo(ip)
        hash = hashlib.sha256(ip.encode('utf8')).hexdigest()
        save_meta(id, hash, loc)
    append_log(id, data)
    return jsonify(success=True)


@app.route('/summary/<id>')
def summary(id):
    """Get gameplay summary for player and
    aggregate stats across all players"""
    # Get cached summary, if available
    summary = get_summary(id)

    # Otherwise, calculate and save
    if summary is None:
        log = get_logs(id)

        # Can only generate summary if there are logs
        # and the game has ended
        if not log or log[-1]['type'] != 'gameOver':
            abort(404)

        logs = defaultdict(list)
        events = []
        for e in log:
            logs[e['type']].append(e['ev'])
            if e['type'] in ['hired', 'enrolled', 'graduated']:
                events.append(e)

        summary = {
            'success': log[-1]['ev']['success'],
            'events': events,
            'loans': sum(e['amount'] for e in logs['loan']),
            'jobs': [e for e in logs['hired']],
            'nApplied': len(logs['applied']),
            'nRejected': len(logs['rejected']),
            'savings': [e['savings'] for e in logs['month']],
            'debt': [e['debt'] for e in logs['month']],
            'expenses': [e['expenses'] for e in logs['month']],
            'education': [e['education'] for e in logs['month']],
            'wages': [e['job']['wage'] for e in logs['month']],
            'baseWages': [e['job'].get('baseWage', 0) for e in logs['month']],
            'end': logs['month'][-1],
            'result': logs['gameOver'][-1] if logs['gameOver'] else None
        }
        save_summary(id, summary)
        aggregate_statistics()

    res = redis.get('fow:aggregate')
    if res:
        agg = json.loads(res)
    else:
        agg = {}
    return jsonify(summary=summary, aggregate=agg)


@app.route('/data/logs')
def logs():
    auth_key = request.headers.get('X-AUTH')
    if auth_key != config.AUTH_KEY:
        abort(401)

    logs = Log.query.all()
    logs = [{
        'id': l.id,
        'session': l.session,
        'timestamp': l.timestamp,
        'data': json.loads(l.data)
    } for l in logs]
    return jsonify(data=logs)


@app.route('/data/summaries')
def summaries():
    auth_key = request.headers.get('X-AUTH')
    if auth_key != config.AUTH_KEY:
        abort(401)

    summaries = Summary.query.all()
    summaries = [{
        'id': l.id,
        'session': l.session,
        'timestamp': l.timestamp,
        'data': json.loads(l.data)
    } for l in summaries]
    return jsonify(data=summaries)


@app.route('/data/meta')
def meta():
    auth_key = request.headers.get('X-AUTH')
    if auth_key != config.AUTH_KEY:
        abort(401)
    metas = Meta.query.all()
    metas = [{
        'session': m.session,
        'ip_hash': m.ip_hash,
        'lat_lng': [m.lat, m.lng],
        'city': m.city,
        'state': m.state,
        'country': m.country
    } for m in metas]
    return jsonify(data=metas)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)