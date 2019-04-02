import uuid from 'uuid/v4';

const BASE_URL = '' // TODO
const IDENTIFIER = uuid();

const log = (endpoint, data, onSuccess) => {
  let url = `${API_BASE}${endpoint}`;
  fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    method: 'POST',
    body: JSON.stringify({
      id: IDENTIFIER,
      data: data
    })
  })
    .then(res => res.json())
    .then((data) => onSuccess(data))
    .catch(err => { throw err });
}

export default log;
