import store from './store';
import skillSims from '../data/skillSims.json';

// Release a robot into the world,
// which affects the wages of jobs
function releaseRobot(robot) {
  let {jobs} = store.getState();
  let updates = [];
  Object.keys(jobs).forEach(id => {
    let job = jobs[id];
    let wageChange = automateJob(job, robot);
    updates.push({
      id: id,
      wage: job.wage + wageChange
    });
  });

  store.dispatch({
    type: 'job:updates',
    payload: updates
  });
}

// Adjust wage for a single job
// based on effects of the specified robot
function automateJob(job, robot) {
  let robotSkillWeight = 0;
  let totalSkillWeight = 0;
  Object.keys(job.skills).forEach(id => {
    let weight = job.skills[id];
    totalSkillWeight += weight;
    if (robot.skills.includes(id)) {
      robotSkillWeight += weight;
    }
  });

  let robotAdjacentSkillWeight = 0;
  robot.skills.forEach(skillId => {
    Object.keys(job.skills).forEach(id => {
      if (id !== skillId) {
        // Get correct ordering of indices
        let a = parseInt(id) < parseInt(skillId) ? id : skillId;
        let b = parseInt(id) < parseInt(skillId) ? skillId : id;
        let sim = (skillSims[a] || {})[b] || 0;
        robotAdjacentSkillWeight += job.skills[id] * sim;
      }
    });
  });

  let displacement = robotSkillWeight/totalSkillWeight;
  let productivityGains = robotAdjacentSkillWeight/totalSkillWeight;
  console.log(`d: ${displacement}`);
  console.log(`p: ${productivityGains}`);
  let wageChange = job.wage * (productivityGains - displacement) * robot.productivity;
  return wageChange;
}

export default { releaseRobot };
