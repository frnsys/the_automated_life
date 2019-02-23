import jobs from './state/jobs';
import skills from './state/skills';
import robots from './state/robots';
import player from './state/player';
import time from './state/time';
import { createStore, combineReducers } from 'redux';

const allReducers = combineReducers({
  jobs: jobs.reducer,
  skills: skills.reducer,
  robots: robots.reducer,
  player: player.reducer,
  time: time.reducer
});

const store = createStore(allReducers, {
  'jobs': jobs.initialState,
  'skills': skills.initialState,
  'player': player.initialState,
  'robots': robots.initialState,
  'time': 0
});

export default store;