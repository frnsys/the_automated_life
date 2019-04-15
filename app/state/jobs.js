import config from 'config';
import jobs from 'data/jobs.json'
import skills from 'data/skills.json'
import industries from 'data/industries.json';

function wageAfterTaxes(wage) {
  let lo = 0;
  let taxes = config.taxBrackets.reduce((acc, br) => {
    let hi = br.amount;
    let taxed = Math.max(0, (wage-lo) - Math.max(0, wage-hi));
    lo = br.amount;
    return acc + (taxed * br.rate);
  }, 0);
  return wage - taxes;
}

// Precompute & cache values we'll reuse often
const industryWeights = {};
Object.keys(industries).forEach((ind) => {
  industryWeights[ind] = industries[ind].reduce((acc, job_id) => {
    return acc + Object.values(jobs[job_id].skills).reduce((acc, cur) => acc + cur, 0);
  }, 0);
});
Object.values(jobs).forEach((job) => {
  job.bestEducation = job.education.indexOf(Math.max(...job.education));
  job.baseWage = job.wage;
  job.wageAfterTaxes = wageAfterTaxes(job.wage);
  job.skillsTotal = Object.values(job.skills).reduce((acc, cur) => acc + cur);
  job.industriesSkillTotal = job.industries.reduce((acc, ind) => acc + industryWeights[ind], 0);
});

function reducer(state={}, {type, payload}) {
  switch (type) {
    case 'job:updates':
      payload.forEach(u => {
        state[u.id].wage = u.wage;
        state[u.id].wageAfterTaxes = wageAfterTaxes(u.wage);
      });
      return {...state}
    case 'job:newSkill':
      let robot = payload;
      notify(`The productivity effects of ${robot.name} are widespread.`);

      let s_id = Object.keys(skills).length;
      skills[s_id] = {
        id: s_id,
        name: `Maintaining ${robot.name}`,
        automatibility: 0
      };

      // If the replaced skills
      // were important enough to a job,
      // add this new skill to that job
      Object.values(state).map((job) => {
        let p = Object.keys(job.skills).reduce((acc, s) => {
          if (robot.skills.includes(parseInt(s))) {
            return acc + job.skills[s];
          }
          return acc;
        }, 0);
        p /= job.skillsTotal;
        if (p >= config.newRobotSkillMinImportance) {
          job.skills[s_id] = p;

          // Remove old skills
          robot.skills.forEach((s) => {
            delete job.skills[s];
          });
          job.skillsTotal = Object.values(job.skills).reduce((acc, cur) => acc + cur);
        }
      });
      return {...state}
  }
  return state;
}

export default { reducer, initialState: jobs };
