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

// If any of these are manually set, make note
let manualOverride = config.twoHops || config.jobSatisfaction || config.schoolSubsidies;
if (manualOverride) {
  log('scenario', 'Manual Override');
} else {
  log('scenario', initialState.name);
}

if (!manualOverride) {
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
}
log('flags', `TWO_HOP_NEIGHBORS=${+(config.twoHops)};JOB_SATISFACTION=${+(config.jobSatisfaction)};SCHOOL_SUBSIDIES=${+(config.schoolSubsidies)}`);

export default { reducer, initialState };
