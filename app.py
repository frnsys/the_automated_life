import json
import redis
from flask import Flask, request, jsonify, render_template

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
    return jsonify(success=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)