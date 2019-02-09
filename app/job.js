import jobs from '../data/jobs.json'
import Skills from './skill';

class Job {
  constructor(id, name, skills, similar) {
    this.id = id;
    this.name = name;
    this.skills = skills;
    this._similar = similar;

    // TODO
    this.wage = Math.random() * 100;
  }

  get similar() {
    return this._similar.map(id => Jobs[id]);
  }

  applyRobot(robot) {
    let robotSkillWeight = 0;
    let totalSkillWeight = 0;
    this.skills.forEach(s => {
      totalSkillWeight += s.weight;
      if (robot.skills.includes(s.skill.id)) {
        robotSkillWeight += s.weight;
      }
    });

    let robotAdjacentSkillWeight = 0;
    robot.skills.forEach(skillId => {
      this.skills.forEach(s => {
        if (s.skill.id !== skillId) {
          // robotAdjacentSkillWeight += (s.weight * sim[skillId, s.skillid]);
          robotAdjacentSkillWeight += (s.weight * 0.0);
        }
      });
    });

    let displacement = robotSkillWeight/totalSkillWeight;
    let productivityGains = robotAdjacentSkillWeight/totalSkillWeight;
    let wageChange = this.wage * (productivityGains - displacement) * robot.productivity;
    this.wage += wageChange;

    return wageChange;
  }
}

const Jobs = Object.assign({}, ...Object.keys(jobs.jobs).map(k => {
  let id = parseInt(k);
  let data = jobs.jobs[k];
  let skills = Object.keys(data.skills).map(id => {
    return {
      skill: Skills[id],
      weight: data.skills[id]
    };
  });
  let job = new Job(id, data.name, skills, data.similar);
  return {[id]: job};
}));


export default Jobs;
