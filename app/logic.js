import store from './store';

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
        // TODO waiting on skill-skill similarity matrix
        // robotAdjacentSkillWeight += (s.weight * sim[skillId, s.skillid]);
        robotAdjacentSkillWeight += job.skills[id] * 0.0;
      }
    });
  });

  let displacement = robotSkillWeight/totalSkillWeight;
  let productivityGains = robotAdjacentSkillWeight/totalSkillWeight;
  let wageChange = job.wage * (productivityGains - displacement) * robot.productivity;

  return wageChange;
}

export default { releaseRobot };
