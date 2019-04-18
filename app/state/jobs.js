import t from 'i18n';
import config from 'config';
import jobs from 'data/jobs.json'
import skills from 'data/skills.json'

// Compute wages after taxes
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

Object.values(jobs).forEach((job) => {
  job.bestEducation = job.education.indexOf(Math.max(...job.education));
  job.baseWage = job.wage;
  job.baseWageAfterTaxes = wageAfterTaxes(job.baseWage);
  job.wageAfterTaxes = wageAfterTaxes(job.wage);
  job.skillsTotal = Object.values(job.skills).reduce((acc, cur) => acc + cur);
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
      notify(t('deepening_automation', {name: robot.name}));

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
        // Proportion of overall skill mass
        // this robot replaces
        let p = Object.keys(job.skills).reduce((acc, s) => {
          if (robot.skills.includes(parseInt(s))) {
            return acc + job.skills[s];
          }
          return acc;
        }, 0);
        p /= job.skillsTotal;

        // If proportion is large enough
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
