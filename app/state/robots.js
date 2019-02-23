import jobs from 'data/jobs.json'
import skills from 'data/skills.json'
import industries from 'data/industries.json';

function reducer(state={}, action) {
  switch (action.type) {
    case 'robot:create':
      let robot = action.payload;
      state[id] = robot;
      return {...state};

    case 'robot:countdown':
      Object.values(state).forEach((r) => {
        r.countdown = Math.max(0, r.countdown - action.payload);
      });
      return {...state};

    case 'robot:deepened':
      let id = action.payload;
      state[id].deepened = true;
      return {...state};
  }
  return state;
}

export default { reducer, initialState: [] };
