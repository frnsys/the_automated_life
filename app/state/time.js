import config from 'config';

const initialState = {
  year: config.startYear,
  years: 0,
  month: 1,
  months: 0,
  monthProgress: 0,
  newMonth: false
}

function reducer(state={}, action) {
  switch (action.type) {
    case 'time':
      let {speedup, elapsed} = action.payload;
      elapsed /= 1000; // to sec
      let secPerMonth = config.secPerMonth/speedup;
      state.monthProgress += elapsed/secPerMonth;
      if (state.monthProgress >= 1) {
        state.monthProgress = state.monthProgress - 1;
        state.months += 1;
        state.month = (state.months % 12) + 1;
        state.years = Math.floor(state.months/12);
        state.year = config.startYear + state.years;
        state.newMonth = true;
      } else {
        state.newMonth = false;
      }
      return {...state};
  }
  return state;
}

export default { reducer, initialState };
