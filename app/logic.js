import store from './store';
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
  let industriesRobotTotal = job.industries.reduce((acc, ind) => {
    return acc + robot.industryWeights[ind];
  }, 0);
  return industriesRobotTotal/job.industriesSkillTotal;
}

function deepeningAutomation(job, robot) {
  return robot.efficiency;
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
    let wageChange = automateJob(job, robot);
    return {
      id: job.id,
      wage: job.wage * wageChange
    };
  });

  store.dispatch({
    type: 'job:updates',
    payload: updates
  });
}

// Adjust wage for a single job
// based on effects of the specified robot
function automateJob(job, robot) {
  let d = displacement(job, robot);
  let p = productivity(job, robot);
  console.log(`productivity: ${p}`);
  return d * p;
}

// Check if player is qualified for the job
// with the given id.
function isQualifiedForJob(id) {
  let {player, jobs} = store.getState();
  return Object.keys(jobs[id].skills)
    .every(skillId => player.skills.includes(skillId));
}

export default { releaseRobot, isQualifiedForJob };
