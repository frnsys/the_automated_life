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
  }
  return state;
}

export default { reducer, initialState: jobs };
