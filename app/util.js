import store from 'store';
import config from 'config';

function inSchool() {
  let {player} = store.getState();
  return player.job.name == 'Student';
}

function secPerMonth() {
  return config.secPerMonth/(inSchool() ? config.schoolTimeSpeedup  : 1);
}

function timeToDate(ms) {
  let sec = ms/1000;
  let months = Math.floor(sec/secPerMonth());
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
  let months = sec/secPerMonth();
  return months - Math.floor(months);
}

export default { timeToDate, timeProgress };
