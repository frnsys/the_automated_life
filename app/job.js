import jobs from '../data/jobs.json'
import Skills from './skill';

class Job {
  constructor(id, name, skills) {
    this.id = id;
    this.name = name;
    this.skills = skills;

    // TODO
    this.wage = null;
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
  let job = new Job(id, data.name, skills);
  return {[id]: job};
}));


export default Jobs;
