import math from 'mathjs';
import store from './store';
import config from 'config';
import skills from 'data/skills.json'

const nameLength = 6;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

// For weighted random sampling of skills
let remainingSkills = [...Object.keys(skills)];

function randomSkills(n) {
  let skillWeights = remainingSkills.map(s_id => skills[s_id].automatibility);
  return math.pickRandom(remainingSkills, skillWeights, n);
}

// Create a random robot
function create() {
  let nSkills = math.random(1, 3);
  let skills = randomSkills(nSkills);
  remainingSkills = remainingSkills.filter(s_id => !skills.includes(s_id));

  let efficiency = math.random();
  let id = math.randomInt(0, 1000); // TODO proper id system
  let name = [...Array(nameLength)].map(_ => math.pickRandom(chars)).join('');

  // Precompute & cache
  let industryWeights = {};
  Object.keys(industries).forEach((ind) => {
    industryWeights[ind] = industries[ind].reduce((acc, job_id) => {
      let job = jobs[job_id];
      return acc + skills.reduce((acc, id) => acc + (job.skills[id] || 0), 0);
    }, 0);
  });

  // Countdown to deepening automation
  // should be in ms
  let countdown = math.random(1*60*1000, 10*60*1000);
  let deepened = false;

  return { id, name, skills, efficiency, countdown, deepened, industryWeights };
}

function createRobot() {
  let robot = create();
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

export default { deepeningAutomation, probabilityForJob };
