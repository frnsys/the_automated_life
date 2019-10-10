import log from 'log';
import math from 'mathjs';
import scenarios from 'data/scenarios.json';
import config from 'config';

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
log('scenario', initialState.name);
console.log(initialState.flags);
if (initialState.flags.TWO_HOP_NEIGHBORS) {
  config.twoHops = true;
}
if (initialState.flags.JOB_SATISFACTION) {
  config.jobSatisfaction = true;
}
if (initialState.flags.SCHOOL_SUBSIDIES) {
  config.schoolSubsidies = true;
}

export default { reducer, initialState };
