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
  let {jobs} = store.getState();
  let updates = Object.values(jobs).map(job => {
    let d = displacement(job, robot);
    let p = productivity(job, robot);
    let newWage = job.wage * d * p;
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

// Update based on how much of the wage of job j is attributed to robot skills
function displacement(job, robot) {
  let robotShare = robot.skills.reduce((acc, id) => acc + (job.skills[id] || 0), 0) * job.wage;
  let jobShare = job.skillsTotal * job.wage;
  return 1 - (robotShare/jobShare);
}

// Productivity gains are felt by jobs that are in the same industry as other jobs which are impacted by automation. Therefore relies on whether two jobs are found in the same industry (indicator function I_jk), and how much the alter job relies on the automated skill. Is normalised by the sum of the RCA of all skills in all jobs in the same industry
function productivity(job, robot) {
  // For jobs where we don't have any industry labels
  if (job.industriesSkillTotal == 0) {
    return 1;
  }
  let industriesRobotTotal = job.industries.reduce((acc, ind) => {
    return acc + robot.industryWeights[ind];
  }, 0);
  return 1 + industriesRobotTotal/job.industriesSkillTotal;
}

// Global benefit across all jobs
function deepeningAutomation(robot) {
  let {jobs} = store.getState();
  let updates = Object.values(jobs).map(job => {
    let newWage = job.wage * (1 + robot.efficiency);
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
function work(job, performance) {
  let changes = {};
  Object.keys(job.skills).forEach((s_id) => {
    changes[s_id] = performance * (job.skills[skill_id]/job.skillsTotal) * config.maxSkillChangePerWork;
  });
  return changes;
}

// Probability of being hired for a job
function probabilityForJob(job) {
  let {player} = store.getState();
  let performance = player.performance/100;

  let education = 1;
  if (job.requiredEducation > 0) {
    education = 1 - (job.requiredEducation - player.education)/job.requiredEducation;
  }
  // Being "overeducated" doesn't provide advantage
  education = Math.min(education, 1);

  let skills = Object.keys(job.skills).reduce((acc, s_id) => {
    return acc + (job.skills[s_id] * player.skills[s_id]);
  }, 0);
  skills /= job.skillsTotal;

  console.log(`performance: ${performance}, education: ${education}, skills: ${skills}`);
  return (performance + education + skills)/3;
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

export default { deepeningAutomation, probabilityForJob, percentAutomated, createRobot };
