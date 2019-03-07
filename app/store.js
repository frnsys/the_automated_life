import jobs from './state/jobs';
import robots from './state/robots';
import player from './state/player';
import scenario from './state/scenario';
import time from './state/time';
import scenarios from 'data/scenarios.json';
import { createStore, combineReducers } from 'redux';

const allReducers = combineReducers({
  jobs: jobs.reducer,
  robots: robots.reducer,
  player: player.reducer,
  time: time.reducer,
  scenario: scenario.reducer
});

const store = createStore(allReducers, {
  jobs: jobs.initialState,
  player: player.initialState,
  robots: robots.initialState,
  scenario: scenario.initialState,
  time: time.initialState
});

export default store;