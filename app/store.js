import jobs from './jobs';
import skills from './skills';
import robots from './robots';
import player from './player';
import time from './time';
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