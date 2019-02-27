const params = location.search.slice(1);
export default {
  startYear: 2019,
  secPerMonth: 10,
  monthlyExpenses: 1000,
  retirementAge: 65,
  retirementSavingsMin: 500000,
  maxSkillChangePerWork: 0.01,
  workPerClick: 10,
  slackPerFrame: 1,
  startingJobs: [0, 1, 2, 3],
  applicationMinMonths: 1,
  skillTrainingMonths: 3,
  skillTrainingGain: 0.1,
  debug: params.includes('debug')
};
