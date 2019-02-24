import config from 'config';

function timeToDate(ms) {
  let sec = ms/1000;
  let months = Math.floor(sec/config.secPerMonth);
  let years = Math.floor(months/12);
  let year = config.startYear + years
  return {
    year: year,
    years: years,
    month: (months % 12) + 1,
    months: months
  };
}

function timeProgress(ms) {
  let sec = ms/1000;
  let months = sec/config.secPerMonth;
  return months - Math.floor(months);
}

export default { timeToDate, timeProgress };
