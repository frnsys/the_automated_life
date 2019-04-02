import uuid from 'uuid/v4';

const IDENTIFIER = uuid();

const log = (data) => {
  fetch('/log', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      id: IDENTIFIER,
      ev: data,
      ts: Date.now()
    })
  })
    .catch(err => { throw err });
}

export default log;
