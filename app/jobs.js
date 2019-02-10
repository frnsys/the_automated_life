import jobs from '../data/jobs.json'

function reducer(state={}, {type, payload}) {
  switch (type) {
    case 'job:updates':
      payload.forEach(u => {
        state[u.id].wage = u.wage;
      });
      return {...state}
  }
  return state;
}

export default { reducer, initialState: jobs };
