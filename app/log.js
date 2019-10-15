import config from 'config';
import uuid from 'uuid/v4';

window.IDENTIFIER = uuid();
console.log(`ID:${IDENTIFIER}`);

const log = (type, data, cb) => {
  if (config.enableLogging) {
    fetch('/log', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        type: type,
        id: IDENTIFIER,
        ev: data,
        ts: Date.now()
      })
    }).then(res => {
      if (cb) cb();
    }).catch(err => { throw err });
  } else {
    console.log(`log:${type}:${JSON.stringify(data)}`);
    if (cb) cb();
  }
}

export default log;
