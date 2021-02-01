import store from 'store';
import config from 'config';
import skills from 'data/skills.json'

// Release a robot into the world,
// which affects the wages of jobs
function releaseRobot(robot) {
  let {jobs, robots} = store.getState();

  robot.deepened = false;
  store.dispatch({
    type: 'robot:create',
    payload: robot
  });

  // The new robot isn't yet included in the state,
  // so manually include here
  robots = Object.values(robots).concat([robot]);
  let automatedSkills = robots.reduce((acc, robot) => {
    return acc.concat(robot.skills)
  }, []);

  // Compute wage updates
  let updates = Object.values(jobs).map(job => {
    let percentNotAutomated = Object.keys(job.skills).reduce((acc, s_id) => {
      if (automatedSkills.includes(parseInt(s_id))) {
        return acc;
      } else {
        return acc + job.skills[s_id];
      }
    }, 0);
    percentNotAutomated /= job.skillsTotal;
    let newWage = job.baseWage * percentNotAutomated;
    return {
      id: job.id,
      wage: newWage
    };
  });

  store.dispatch({
    type: 'job:updates',
    payload: updates
  });
}

// Global benefit across all jobs
function deepeningAutomation(robot) {
  let {jobs} = store.getState();
  let updates = Object.values(jobs).map(job => {
    let newWage = job.wage * (1 + (config.deepeningAutomationAlpha * robot.efficiency));
    return {
      id: job.id,
      wage: newWage
    };
  });
  store.dispatch({
    type: 'job:updates',
    payload: updates
  });
}

// Do work for a job, returning skill changes
// `performance` in [0-1]
function workSkillGain(job, performance) {
  let changes = {};
  Object.keys(job.skills).forEach((s_id) => {
    changes[s_id] = performance * (job.skills[s_id]/job.skillsTotal) * config.maxSkillChangePerWork;
  });
  return changes;
}

function jobProficiency(job, player) {
  let proficiency = Object.keys(job.skills).reduce((acc, s_id) => {
    let s = job.skills[s_id] * player.skills[s_id];
    // Fallback
    if (isNaN(s)) s = job.skills[s_id];
    return acc + s;
  }, 0);
  proficiency /= job.skillsTotal;
  return proficiency;
}

function jobSkillLevels(job, player) {
  let skillComparisons = Object.keys(job.skills).map((s_id) => {
    let s = job.skills[s_id] * player.skills[s_id];
    return [s_id, job.skills[s_id] - s];
  });
  skillComparisons.sort((a, b) => b[1] - a[1]);
  return skillComparisons;
}

// window.testJob = {skills: {0: 1}, skillsTotal: 1};
// window.testPlayer = {skills: {}};
// window.TESTING = jobProficiency;

// Probability of being hired for a job
function probabilityForJob(job) {
  let {player} = store.getState();
  let skills = jobProficiency(job, player);
  let performance = player.ignoreJobPerformance ? 1 : player.performance/100;

  let education = job.education.slice(0, player.education+1).reduce((acc, percent) => {
    return acc + percent;
  }, 0);
  education /= 100;

  if (player.job.name == 'Unemployed') {
    performance = Math.max(performance, 0.5);
  }

  let factors = { performance, education, skills };
  let mainFactor = Object.keys(factors).reduce((m, k) => {
    if (m === null) return k;
    return factors[k] < factors[m] ? k : m
  }, null);

  let prob = (performance + education + skills)/3;

  let details = {};
  if (mainFactor == 'skills') {
    details.skillShortfalls = jobSkillLevels(job, player).slice(0, 5);
  }
  return { prob, mainFactor, factors, details };
}

// How much a job is automated
function percentAutomated(job) {
  let {robots} = store.getState();
  let automated = Object.values(robots).reduce((acc, r) => {
    return acc.concat(r.skills);
  }, []);
  let score = Object.keys(job.skills).reduce((acc, s_id) => {
    return acc + (automated.includes(parseInt(s_id)) ? job.skills[s_id] : 0);
  }, 0);
  return score/job.skillsTotal;
}

export default { deepeningAutomation, probabilityForJob, percentAutomated, releaseRobot,
  workSkillGain, jobProficiency};
