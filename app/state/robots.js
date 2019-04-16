import jobs from 'data/jobs.json'
import skills from 'data/skills.json'

function reducer(state={}, action) {
  switch (action.type) {
    case 'robot:create':
      let robot = action.payload;
      state[robot.id] = robot;
      return {...state};

    case 'robot:countdown':
      Object.values(state).forEach((r) => {
        r.deepeningCountdown = Math.max(0, r.deepeningCountdown - 1);
      });
      return {...state};

    case 'robot:deepened': {
      let id = action.payload;
      state[id].deepened = true;
      return {...state};
    }
  }
  return state;
}

export default { reducer, initialState: {} };
