import config from './config';

function reducer(state=0, action) {
  switch (action.type) {
    case 'time':
      // Increment game time
      return state + action.payload;
  }
  return state;
}

function timeToDate(ms) {
  let sec = ms/1000;
  let months = Math.floor(sec/config.secPerMonth);
  let years = Math.floor(months/12);
  let year = config.startYear + years
  return {
    year: year,
    month: (months % 12) + 1
  };
}

export default { reducer, timeToDate };
