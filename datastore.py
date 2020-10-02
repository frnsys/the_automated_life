import json
from time import time
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(session_options={'autoflush': False})

class Meta(db.Model):
    session         = db.Column(db.String(), primary_key=True)
    ip_hash         = db.Column(db.String())
    lat             = db.Column(db.Float())
    lng             = db.Column(db.Float())
    city            = db.Column(db.Unicode())
    state           = db.Column(db.Unicode())
    country         = db.Column(db.Unicode())

class Log(db.Model):
    id              = db.Column(db.Integer(), primary_key=True)
    session         = db.Column(db.String())
    data            = db.Column(db.Unicode())
    timestamp       = db.Column(db.BigInteger())

class Summary(db.Model):
    id              = db.Column(db.Integer(), primary_key=True)
    session         = db.Column(db.String())
    data            = db.Column(db.Unicode())
    timestamp       = db.Column(db.BigInteger())


def append_log(id, data):
    ts = int(time() * 1000) # ms
    log = Log(session=id, data=json.dumps(data), timestamp=ts)
    db.session.add(log)
    db.session.commit()

def save_meta(id, ip_hash, loc):
    if loc.latlng:
        lat, lng = loc.latlng
    else:
        lat, lng = None, None
    meta = Meta(session=id, ip_hash=ip_hash, lat=lat, lng=lng, city=loc.city, state=loc.state, country=loc.country)
    db.session.add(meta)
    db.session.commit()

def get_meta(id):
    return Meta.query.get(id)

def get_logs(id):
    return sorted([json.loads(l.data) for l in Log.query.filter_by(session=id).all()], key=lambda l: l['ts'])

def save_summary(id, data):
    ts = int(time() * 1000) # ms
    summary = Summary(session=id, data=json.dumps(data), timestamp=ts)
    db.session.add(summary)
    db.session.commit()

def get_summary(id):
    s = Summary.query.filter_by(session=id).first()
    if s is not None:
        return json.loads(s.data)

def get_summaries():
    return [json.loads(s.data) for s in Summary.query.all()]
