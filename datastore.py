import json
import sqlite3
from time import time
from sqlalchemy import MetaData
from flask_sqlalchemy import SQLAlchemy

naming_convention = {
    "ix": 'ix_%(column_0_label)s',
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(column_0_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}
db = SQLAlchemy(session_options={'autoflush': False}, metadata=MetaData(naming_convention=naming_convention))

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
    timestamp       = db.Column(db.Integer())

class Summary(db.Model):
    id              = db.Column(db.Integer(), primary_key=True)
    session         = db.Column(db.String())
    data            = db.Column(db.Unicode())
    timestamp       = db.Column(db.Integer())


def append_log(id, data):
    ts = time() * 1000 # ms
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
    return [json.loads(l.data) for l in Log.query.filter_by(session=id).all()]

def save_summary(id, data):
    ts = time() * 1000 # ms
    summary = Summary(session=id, data=json.dumps(data), timestamp=ts)
    db.session.add(summary)
    db.session.commit()

def get_summary(id):
    s = Summary.query.filter_by(session=id).first()
    if s is not None:
        return json.loads(s.data)

def get_summaries():
    return [json.loads(s.data) for s in Summary.query.all()]
