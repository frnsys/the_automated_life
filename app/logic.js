import store from './store';
import config from './config';
import jobs from '../data/jobs.json'
import skillSims from '../data/skillSims.json';

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

function newSkill(job, robot) {
  let robotShare = robot.skills.reduce((acc, id) => acc + (job.skills[id] || 0), 0);
  let jobShare = job.skillsTotal;
  return robotShare/jobShare * robot.efficiency;
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

// Check if player is qualified for the job
// with the given id.
function isQualifiedForJob(id) {
  let {player, jobs} = store.getState();
  return Object.keys(jobs[id].skills)
    .every(skillId => player.skills.includes(skillId));
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

export default { releaseRobot, isQualifiedForJob };
