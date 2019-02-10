import jobs from './jobs';
import skills from './skills';
import robots from './robots';
import player from './player';
import { createStore, combineReducers } from 'redux';

const allReducers = combineReducers({
  jobs: jobs.reducer,
  skills: skills.reducer,
  robots: robots.reducer,
  player: player.reducer
});

const store = createStore(allReducers, {
  'jobs': jobs.initialState,
  'skills': skills.initialState,
  'player': player.initialState,
  'robots': robots.initialState
});

export default store;