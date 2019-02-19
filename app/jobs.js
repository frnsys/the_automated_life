import jobs from '../data/jobs.json'

// Precompute & cache values we'll reuse often
Object.values(jobs).forEach((job) => {
  job.skillsTotal = Object.values(job.skills).reduce((acc, cur) => acc + cur);
});

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
