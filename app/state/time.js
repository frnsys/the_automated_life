import config from 'config';

const initialState = {
  year: config.startYear,
  years: 0,
  month: 1,
  months: 0,
  monthProgress: 0,
  newMonth: false,
  newYear: false
}

function reducer(state={}, action) {
  switch (action.type) {

    // Tick time
    case 'time':
      let {speedup, elapsed} = action.payload;

      let secPerMonth = config.secPerMonth/speedup;
      elapsed /= 1000; // convert to sec

      state.monthProgress += elapsed/secPerMonth;
      state.newYear = false;

      // New month
      if (state.monthProgress >= 1) {
        state.monthProgress = state.monthProgress - 1;
        state.months += 1;
        state.month = (state.months % 12) + 1;

        let years = Math.floor(state.months/12);
        if (years != state.years) {
          state.newYear = true;
        }
        state.years = years;
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
