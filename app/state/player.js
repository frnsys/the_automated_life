import config from 'config';
import logic from '../logic';
import skills from 'data/skills.json'
import education from 'data/education.json'
import graph from '../ui/3d/graph';

const student = {
  name: 'Student',
  wage: 0,
  wageAfterTaxes: 0
};
const unemployed = {
  name: 'Unemployed',
  wage: 0,
  wageAfterTaxes: 0
};

const initialState = {
  gameOver: false,
  startAge: 18,
  performance: 0,
  tasks: 0,
  cash: 0,
  debt: [],
  expenses: {
    living: config.monthlyExpenses,
    debt: 0
  },
  education: config.startHighSchool ? 1 : 0,
  program: null,
  postGradJob: unemployed,
  schoolCountdown: 0, // months
  job: unemployed,
  jobProficiency: 0,
  application: null,
  skills: Object.keys(skills).reduce((obj, s_id) => {
    obj[s_id] = 0.1;
    return obj;
  }, {}),
  pastJobs: []
};


function reducer(state={}, action) {
  switch (action.type) {
    case 'player:income':
      state.cash += state.job.wageAfterTaxes/12;
      return {...state}
    case 'player:expenses':
      state.cash -= config.monthlyExpenses;
      let debtPayment = state.debt.reduce((acc, debt) => {
        if (debt.countdown > 0 && debt.startedPayments) {
          debt.countdown--;
          return acc + debt.monthlyPayment;
        } else {
          return acc;
        }
      }, 0);
      if (debtPayment) {
        state.expenses.debt = debtPayment;
        state.cash -= debtPayment;
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

      // starting job, set skills
      if (state.pastJobs.length == 0) {
        Object.keys(action.payload.skills).forEach((s_id) => {
          state.skills[s_id] = 0.2;
        });
      }

      if (state.job.name == 'Student') {
        // Dropped out of school, loan repayment kicks in
        notify('You dropped out of school.')
        if (state.debt) {
          state.debt[state.debt.length-1].startedPayments = true;
        }
      }
      state.performance = 0;
      state.application = null;
      state.job = action.payload; // TODO should we just assign the id, in case this object and the actual job become desync?
      return {...state}

    case 'player:enroll':
      let {program, nextJob} = action.payload;
      let nextLevel = education[state.education+1];
      if (nextLevel.name == 'Secondary Degree') {
        state.program = program;
        state.postGradJob = nextJob;
      }
      let years = state.program ? state.program.years : nextLevel.years;
      state.cash -= nextLevel.cost * years;
      state.job = student;
      state.schoolCountdown = years * 12;
      return {...state}
    case 'player:learn':
      state.schoolCountdown -= 1;
      return {...state}
    case 'player:graduate':
      state.education += 1;
      state.schoolCountdown = 0;
      state.job = unemployed;
      if (state.debt.length > 0) {
        state.debt[state.debt.length-1].startedPayments = true;
      }

      if (state.program !== null) {
        graph.unlock(state.program.job, state);
        state.program = null;
        state.job = state.postGradJob;
        state.postGradJob = unemployed;
      } else {
        graph.unlock();
      }
      notify('Congratulations! You graduated.', {background: '#1fd157', color: '#fff'})
      return {...state}

    case 'player:work':
      state.performance = Math.min(state.performance + (config.baseWorkPerClick*(1+state.jobProficiency)/Math.sqrt(state.tasks)), 100);
      state.tasks--;

      // Improve skills used on this job
      let skillChanges = logic.workSkillGain(state.job, state.performance)
      Object.keys(skillChanges).map((s_id) => {
        state.skills[s_id] = Math.min(1, (state.skills[s_id] || 0) + skillChanges[s_id]);
      });
      state.jobProficiency = logic.jobProficiency(state.job, state);

      return {...state}

    case 'player:slack':
      state.performance = Math.max(state.performance - config.slackPerFrame, 0);
      let taskMultiplier = 1/(Math.max(1, Math.sqrt(state.tasks/5)));
      if (Math.random() <= (config.taskProb * taskMultiplier)) {
        state.tasks++;
      }
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
