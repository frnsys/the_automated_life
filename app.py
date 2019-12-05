import json
import redis
import config
import hashlib
import geocoder
from datastore import db, get_meta, save_meta, append_log, get_logs, save_summary, get_summary
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

    # Compute summary statistics
    if data['type'] == 'gameOver':
        log = get_logs(id)
        logs = defaultdict(list)
        events = []
        for e in log:
            logs[e['type']].append(e['ev'])
            if e['type'] in ['hired', 'enrolled', 'graduated']:
                events.append(e)

        summary = {
            'success': data['ev']['success'],
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
            'result': logs['gameEnd'][-1] if logs['gameEnd'] else None
        }
        save_summary(id, summary)

    return jsonify(success=True)


@app.route('/summary/<id>')
def summary(id):
    """Get gameplay summary for player and
    aggregate stats across all players"""
    # Get cached summary, if available
    summary = get_summary(id)
    if summary is None:
        abort(404)

    res = redis.get('fow:aggregate')
    if res:
        agg = json.loads(res)
    else:
        agg = {}
    return jsonify(summary=summary, aggregate=agg)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)