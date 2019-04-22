import json
import redis
import config
from collections import defaultdict
from flask import Flask, request, jsonify, render_template, abort
from sentry_sdk.integrations.flask import FlaskIntegration
import sentry_sdk

sentry_sdk.init(
    dsn=config.SENTRY_DSN,
    integrations=[FlaskIntegration()]
)

app = Flask(__name__)

app = Flask(__name__)
redis = redis.Redis(host='localhost', port=6379, db=1)

@app.route('/')
def game():
    return render_template('index.html')

@app.route('/log', methods=['POST'])
def log():
    data = request.get_json()
    id = data['id']
    del data['id']
    data['ip'] = request.environ['REMOTE_ADDR']
    redis.lpush('fow:{}'.format(id), json.dumps(data))
    redis.save()

    # Compute summary statistics
    if data['type'] == 'gameOver':
        log = [json.loads(r.decode('utf8')) for r in redis.lrange('fow:{}'.format(id), 0, -1)][::-1]

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
        redis.set('fow:{}:summary'.format(id), json.dumps(summary))
        redis.save()

    return jsonify(success=True)

@app.route('/summary/<id>')
def summary(id):
    # Get cached summary, if available
    res = redis.get('fow:{}:summary'.format(id))
    if res is None:
        abort(404)

    summary = json.loads(res)

    res = redis.get('fow:aggregate')
    agg = json.loads(res)
    return jsonify(summary=summary, aggregate=agg)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)