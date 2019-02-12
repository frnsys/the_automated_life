function reducer(state={}, action) {
  switch (action.type) {
    case 'player:income':
      state.cash += state.job.wage;
      return {...state}
    case 'player:hire':
      state.job = action.payload;
      return {...state}
  }
  return state;
}

export default { reducer, initialState: {
  cash: 0,
  job: {
    name: 'Unemployed',
    wage: 0
  }
}};
