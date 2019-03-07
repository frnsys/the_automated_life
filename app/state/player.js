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
  gameOver: false,
  startAge: 18,
  performance: 0,
  cash: 0,
  debt: [],
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
      notify(`You paid $${config.monthlyExpenses} in living expenses.`);
      let debtPayment = state.debt.reduce((acc, debt) => {
        if (debt.countdown > 0 && debt.startedPayments) {
          debt.countdown--;
          return acc + debt.monthlyPayment;
        } else {
          return acc;
        }
      }, 0);
      if (debtPayment) {
        state.cash -= debtPayment;
        notify(`You paid $${debtPayment} in debt payments.`);
      }
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
      if (state.job.name == 'Student') {
        // Dropped out of school, loan repayment kicks in
        notify('You dropped out of school.')
        if (state.debt) {
          state.debt[state.debt.length-1].startedPayments = true;
        }
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
      if (state.debt) {
        state.debt[state.debt.length-1].startedPayments = true;
      }
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

    case 'player:loan':
      let amount = action.payload;
      let i = config.loanTerms.interestRate/12;
      let n = config.loanTerms.years * 12;
      let D = ((1+i)**n - 1)/(i*(1+i)**n);
      let monthlyPayment = Math.round(amount/D);
      state.debt.push({
        amount: amount,
        monthlyPayment: monthlyPayment,
        countdown: config.loanTerms.years * 12,
        startedPayments: false
      });
      state.cash += amount;
      return {...state}

    case 'player:gameOver':
      state.gameOver = true;
      return {...state}
  }
  return state;
}

export default { reducer, initialState }
