import t from 'i18n';
import math from 'mathjs';
import config from 'config';
import logic from '../logic';
import skills from 'data/skills.json'
import education from 'data/education.json'
import graph from '../ui/3d/graph';

// Special jobs
const student = {
  id: -1,
  name: 'Student',
  wage: 0,
  wageAfterTaxes: 0
};
const unemployed = {
  id: -2,
  name: 'Unemployed',
  wage: 0,
  wageAfterTaxes: 0
};

const initialState = {
  gameOver: false,
  gameOverWarned: false,
  wasFired: false,
  retireEarly: false,
  startAge: 18,
  performance: 0,
  badPerformanceStreak: 0,
  tasks: [],
  cash: 0,
  debt: [],
  expenses: {
    living: config.monthlyExpenses,
    debt: 0
  },
  education: config.startHighSchool ? 1 : 0,
  program: null,
  nextLevelIdx: null,
  postGradJob: unemployed,

  // ignore job performance when applying to first job after school
  ignoreJobPerformance: false,

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

    // Monthly wage
    case 'player:income':
      state.cash += state.job.wageAfterTaxes/12;
      return {...state}

    // Monthly expenses
    case 'player:expenses':
      let expenses = config.monthlyExpenses;

      // Incorporate education subsidy, if any
      expenses *= 1 - (state.job.name == 'Student' && config.schoolSubsidies ? 1 - config.subsidyPercent : 0);

      state.cash -= expenses;

      // Calculate debt payment, if any
      let debtPayment = state.debt.reduce((acc, debt) => {
        if (debt.countdown > 0 && debt.startedPayments) {
          debt.countdown--;
          debt.remaining -= debt.monthlyPayment;
          return acc + debt.monthlyPayment;
        } else {
          return acc;
        }
      }, 0);
      state.expenses.debt = debtPayment;
      state.cash -= debtPayment;
      return {...state}

    // Submit application to new job
    case 'player:apply': {
      if (!state.application) {
        state.application = action.payload;
        state.application.countdown = config.applicationMinMonths - 1;
      }
      return {...state}
    }

    // Tick application wait time
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

    // Start new job
    case 'player:hire':
      if (state.job.id) {
        state.pastJobs.push(state.job.id);
      }

      // Starting job, set skills
      if (state.pastJobs.length == 0) {
        Object.keys(action.payload.skills).forEach((s_id) => {
          state.skills[s_id] = 0.2;
        });
      }

      if (state.job.name == 'Student') {
        // Dropped out of school, loan repayment kicks in
        notify(t('drop_out'))
        if (state.debt) {
          state.debt[state.debt.length-1].startedPayments = true;
        }
      }

      // Reset stuff for new job
      state.performance = 60;
      state.badPerformanceStreak = 0;
      state.application = null;
      state.job = action.payload;
      state.tasks = [];
      state.ignoreJobPerformance = false;
      return {...state}

    // Enroll in school
    case 'player:enroll':
      // Reset
      state.badPerformanceStreak = 0;

      let {program, nextJob, nextLevelIdx} = action.payload;
      let nextLevel = education[nextLevelIdx];
      if (nextLevel.name == 'Secondary Degree') {
        state.program = program;
        state.postGradJob = nextJob;
      }
      state.nextLevelIdx = nextLevelIdx;

      // Compute cost and years in school
      let years = state.program ? state.program.years : nextLevel.years;
      let subsidyPercent = config.schoolSubsidies ? 1 - config.subsidyPercent : 0;
      let schoolCost = nextLevel.cost * years * (1-subsidyPercent);
      state.cash -= schoolCost;
      state.schoolCountdown = years * 12;

      state.job = student;
      return {...state}

    // Tick school time
    case 'player:learn':
      state.schoolCountdown -= 1;
      return {...state}

    // Finish school
    case 'player:graduate':
      // Apply graduation effects
      state.education = state.nextLevelIdx;
      state.schoolCountdown = 0;
      state.job = unemployed;
      state.ignoreJobPerformance = true;
      if (state.debt.length > 0) {
        state.debt[state.debt.length-1].startedPayments = true;
      }
      state.nextLevelIdx = null;

      // If completing education w/ a specific program
      // (which has an associated job)
      // automatically start in that job
      if (state.program !== null) {
        graph.unlock(state.program.job, state);
        state.program = null;
        state.job = state.postGradJob;
        state.postGradJob = unemployed;

      // Otherwise, let player apply to any discovered jobs
      } else {
        graph.unlock();
      }

      milestone(t('graduated'), '', 'graduated');
      notify(`🎓 ${t('graduated')}`, '', {background: '#1fd157', color: '#fff'});

      // Set full performance
      // so player isn't penalized when applying to the
      // first job out of school.
      state.performance = 100;

      // Reset speed
      window.speedup = 0.5;
      window.updateSpeed(window.speedup);
      return {...state}

    case 'player:task':
      let taskIndex = action.payload;
      state.tasks.splice(taskIndex, 1);
      return {...state}

    // Increase performance
    case 'player:work':
      state.performance = Math.min(state.performance + (config.baseWorkPerClick*(1+state.jobProficiency)/Math.sqrt(state.tasks.length) * state.job.pattern.length), 100);

      // Improve skills used on this job
      let skillChanges = logic.workSkillGain(state.job, state.performance)
      Object.keys(skillChanges).map((s_id) => {
        state.skills[s_id] = Math.min(1, (state.skills[s_id] || 0) + skillChanges[s_id]);
      });
      state.jobProficiency = logic.jobProficiency(state.job, state);

      return {...state}

    // Decrease performance
    case 'player:slack':
      let multiplier = Math.max(1, Math.sqrt(state.tasks.length/8));
      let cognitiveness = (1 - Math.max(state.job.cognitive, 0.8));
      state.performance = Math.max(state.performance - (config.slackPerFrame * multiplier/3 * cognitiveness * window.speedup), 0);
      if (state.tasks.length < config.maxTasks) {
        if (Math.random() <= (config.taskProb * cognitiveness * 1/multiplier) * window.speedup) {
          let taskType = math.pickRandom(state.job.pattern);
          state.tasks.push(taskType);
        }
      }

      // If player goes above terrible performance,
      // reset bad performance streak
      if (state.performance > 10) {
        state.badPerformanceStreak = 0;
      }

      return {...state}

    // Create task manually (for tutorial)
    case 'player:newTask':
      [...Array(action.payload).keys()].forEach(() => {
        let taskType = math.pickRandom(state.job.pattern);
        state.tasks.push(taskType);
      });
      return {...state}

    case 'player:evaluatePerformance':
      if (state.performance <= 10) {
        state.badPerformanceStreak += 1;
      }
      if (state.badPerformanceStreak >= config.maxBadPerformanceStreak + 1) {
        state.job = unemployed;
        state.wasFired = true;
        milestone(t('fired'), '', 'fired');
        notify(`📉 ${t('fired')}`, '', {background: '#ea432a', color: '#fff', fontWeight: 'bold'});

        // Reset
        state.badPerformanceStreak = 0;
      }
      return {...state}

    case 'player:resetFired':
      state.wasFired = false;
      return {...state}

    // Take out loan
    case 'player:loan':
      // Compute monthly payment
      let amount = action.payload;
      let i = config.loanTerms.interestRate/12;
      let n = config.loanTerms.years * 12;
      let D = ((1+i)**n - 1)/(i*(1+i)**n);
      let monthlyPayment = Math.round(amount/D);

      state.debt.push({
        amount: amount,
        remaining: amount,
        monthlyPayment: monthlyPayment,
        countdown: config.loanTerms.years * 12,
        startedPayments: false
      });
      state.cash += amount;
      return {...state}

    case 'player:retireEarly':
      state.retireEarly = true;
      return {...state}

    case 'player:gameOver':
      state.gameOver = true;
      return {...state}

    case 'player:gameOverWarned':
      state.gameOverWarned = true;
      return {...state}

    case 'player:resetGameOverWarned':
      state.gameOverWarned = false;
      return {...state}

    // Birthday, aka new year
    case 'player:birthday':
      state.expenses.living = Math.round(state.expenses.living * (1 + config.inflation));
      return {...state}
  }
  return state;
}

export default { reducer, initialState }
