import config from './config';

function reducer(state={}, action) {
  switch (action.type) {
    case 'player:income':
      state.cash += state.job.wage;
      return {...state}
    case 'player:expenses':
      state.cash -= config.monthlyExpenses;
      return {...state}
    case 'player:hire':
      state.job = action.payload;
      return {...state}
    case 'player:train':
      state.skills.push(action.payload.skill);
      state.cash -= action.payload.cost;
      return {...state}
  }
  return state;
}

export default { reducer, initialState: {
  cash: 0,
  skills: [],
  job: {
    name: 'Unemployed',
    wage: 0
  }
}};
