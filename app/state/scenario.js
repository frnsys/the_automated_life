import math from 'mathjs';
import scenarios from 'data/scenarios.json';

function reducer(state={}, action) {
  switch (action.type) {
    case 'scenario:increment':
      state.schedule.shift();
      return {...state};

    case 'scenario:teased':
      state.schedule[action.payload].teased = true;
      return {...state};
  }
  return state;
}

let initialState = math.pickRandom(scenarios);

export default { reducer, initialState };
