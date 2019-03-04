import config from 'config';
import logic from '../logic';
import skills from 'data/skills.json'
import education from 'data/education.json'

const student = {
  name: 'Student',
  wage: 0
};
const unemployed = {
  name: 'Unemployed',
  wage: 0
};

const initialState = {
  startAge: 18,
  performance: 0,
  cash: 0,
  education: 0,
  schoolCountdown: 0, // months
  job: unemployed,
  jobProficiency: 0,
  application: null,
  skills: Object.keys(skills).reduce((obj, s_id) => {
    obj[s_id] = Math.random(); // TODO temporary
    return obj;
  }, {}),
  pastJobs: []
};


function reducer(state={}, action) {
  switch (action.type) {
    case 'player:income':
      state.cash += state.job.wage/12;
      return {...state}
    case 'player:expenses':
      state.cash -= config.monthlyExpenses;
      return {...state}

    case 'player:apply': {
      if (!state.application) {
        state.application = action.payload;
        state.application.countdown = config.applicationMinMonths - 1;
      }
      return {...state}
    }
    case 'player:application': {
      if (state.application) {
        if (state.application.countdown <= 0) {
          state.application = null;
        } else {
          state.application.countdown = Math.max(state.application.countdown - 1, 0);
        }
      }
      return {...state}
    }
    case 'player:hire':
      if (state.job.id) {
        state.pastJobs.push(state.job.id);
      }
      state.application = null;
      state.job = action.payload; // TODO should we just assign the id, in case this object and the actual job become desync?
      return {...state}

    case 'player:enroll':
      let nextLevel = education[state.education+1];
      state.cash -= nextLevel.cost;
      state.job = student;
      state.schoolCountdown = nextLevel.years * 12;
      return {...state}
    case 'player:learn':
      state.schoolCountdown -= 1;
      return {...state}
    case 'player:graduate':
      state.education += 1;
      state.schoolCountdown = 0;
      state.job = unemployed;
      return {...state}

    case 'player:work':
      state.performance = Math.min(state.performance + config.workPerClick, 100);

      // Improve skills used on this job
      let skillChanges = logic.workSkillGain(state.job, state.performance)
      Object.keys(skillChanges).map((s_id) => {
        state.skills[s_id] = Math.min(1, state.skills[s_id] + skillChanges[s_id]);
      });
      state.jobProficiency = logic.jobProficiency(state.job, state);

      return {...state}

    case 'player:slack':
      let slack = config.slackPerFrame * (1-state.jobProficiency) + config.minSlackPerFrame;
      state.performance = Math.max(state.performance - slack, 0);
      return {...state}
  }
  return state;
}

export default { reducer, initialState }
