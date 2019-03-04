import jobs from 'data/jobs.json'
import skills from 'data/skills.json'
import industries from 'data/industries.json';

// Precompute & cache values we'll reuse often
const industryWeights = {};
Object.keys(industries).forEach((ind) => {
  industryWeights[ind] = industries[ind].reduce((acc, job_id) => {
    return acc + Object.values(jobs[job_id].skills).reduce((acc, cur) => acc + cur, 0);
  }, 0);
});
Object.values(jobs).forEach((job) => {
  job.skillsTotal = Object.values(job.skills).reduce((acc, cur) => acc + cur);
  job.industriesSkillTotal = job.industries.reduce((acc, ind) => acc + industryWeights[ind], 0);

  // Weighted mean risk of a job at being automated
  let risk = Object.keys(job.skills).reduce((acc, s_id) => {
    return acc + (job.skills[s_id] * skills[s_id].automatibility);
  }, 0);
  job.automationRisk = risk/job.skillsTotal;
});

function reducer(state={}, {type, payload}) {
  switch (type) {
    case 'job:updates':
      payload.forEach(u => {
        state[u.id].wage = u.wage;
      });
      return {...state}
  }
  return state;
}

export default { reducer, initialState: jobs };
