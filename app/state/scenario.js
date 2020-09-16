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
let flags = {
  twoHops: config.twoHops,
  jobSatisfaction: config.jobSatisfaction,
  schoolSubsidies: config.schoolSubsidies
};
if (manualOverride) {
  log('scenario', {
    name: 'Manual Override',
    flags: flags
  });
} else {
  log('scenario', {
    name: initialState.name,
    flags: flags
  });
}

export default { reducer, initialState };
