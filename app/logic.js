import math from 'mathjs';
import store from 'store';
import config from 'config';
import skills from 'data/skills.json'
import industries from 'data/industries.json'

function createRobot(robot) {
  let {jobs} = store.getState();
  robot.deepened = false;

  // Precompute & cache
  let industryWeights = {};
  Object.keys(industries).forEach((ind) => {
    industryWeights[ind] = industries[ind].reduce((acc, job_id) => {
      let job = jobs[job_id];
      return acc + robot.skills.reduce((acc, id) => acc + (job.skills[id] || 0), 0);
    }, 0);
  });
  robot.industryWeights = industryWeights;

  releaseRobot(robot);
  store.dispatch({
    type: 'robot:create',
    payload: robot
  });
}

// Release a robot into the world,
// which affects the wages of jobs
function releaseRobot(robot) {
  let {jobs, robots} = store.getState();

  // The new robot isn't yet included in the state,
  // so manually include here
  robots = Object.values(robots).concat([robot]);
  let automatedSkills = robots.reduce((acc, robot) => {
    return acc.concat(robot.skills)
  }, []);

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

// A new skill resulting from the creation of a robot
function newSkill(job, robot) {
  let robotShare = robot.skills.reduce((acc, id) => acc + (job.skills[id] || 0), 0);
  let jobShare = job.skillsTotal;
  return robotShare/jobShare * robot.efficiency;
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
    return acc + (job.skills[s_id] * player.skills[s_id]);
  }, 0);
  proficiency /= job.skillsTotal;
  return proficiency;
}

// Probability of being hired for a job
function probabilityForJob(job) {
  let {player} = store.getState();
  let performance = player.performance/100;

  let education = job.education.slice(0, player.education+1).reduce((acc, percent) => {
    return acc + percent;
  }, 0);
  education /= 100;

  let skills = jobProficiency(job, player);

  let factors = { performance, education, skills };
  let mainFactor = Object.keys(factors).reduce((m, k) => {
    if (m === null) return k;
    return factors[k] < factors[m] ? k : m
  }, null);

  console.log(`performance: ${performance}, education: ${education}, skills: ${skills}`);
  console.log(mainFactor);
  let prob = (performance + education + skills)/3;
  return { prob, mainFactor };
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

export default { deepeningAutomation, probabilityForJob, percentAutomated, createRobot,
  workSkillGain, jobProficiency};
