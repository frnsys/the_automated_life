const params = location.search.slice(1);
export default {
  startYear: 2019,
  secPerMonth: 5,
  schoolTimeSpeedup: 25,
  unemployedTimeSpeedup: 0.2,

  // Using data for 1 adult across NY state from:
  // <http://livingwage.mit.edu/states/36>
  monthlyExpenses: 2200,

  retirementAge: 65,
  retirementSavingsMin: 500000,
  gameOverBalance: -100000,
  deepeningAutomationAlpha: 0.05,
  inflation: 0.015,
  newRobotSkillMinImportance: 0.03,
  newRobotWarningMonths: 8,
  startingJobs: [643, 721, 333, 717],
  applicationMinMonths: 2,
  loanTerms: {
    interestRate: 0.058,
    years: 10
  },
  subsidyPercent: 0.5,

  industryIcons: {
    'Professional, Scientific, and Technical Services': '📝',
    'Finance and Insurance': '💵',
    'Manufacturing': '🏭',
    'Government': '🏛️',
    'Educational Services': '🏫',
    'Health Care and Social Assistance': '🏥',
    'Information': '🖥️',
    'Arts, Entertainment, and Recreation': '🎭',
    'Agriculture, Forestry, Fishing, and Hunting': '🌽',
    'Wholesale Trade': '📦',
    'Transportation and Warehousing': '🚚',
    'Other Services (Except Public Administration)': '🅾️',
    'Real Estate and Rental and Leasing': '🏘️',
    'Construction': '🏗️',
    'Retail Trade': '🛍️',
    'Accommodation and Food Services': '🏨',
    'Administrative and Support Services': '🗃️',
    'Management of Companies and Enterprises': '📈',
    'Mining, Quarrying, and Oil and Gas Extraction': '⛏️',
    'Utilities': '💡'
  },

  // <https://www.bankrate.com/finance/taxes/tax-brackets.aspx>
  taxBrackets: [{
    amount: 13600,
    rate: 0.1
  }, {
    amount: 51800,
    rate: 0.12
  }, {
    amount: 82500,
    rate: 0.22
  }, {
    amount: 157500,
    rate: 0.24
  }, {
    amount: 200000,
    rate: 0.32
  }, {
    amount: 500000,
    rate: 0.35
  }, {
    amount: 100000000,
    rate: 0.37
  }],

  // Work minigame
  maxSkillChangePerWork: 0.002,
  baseWorkPerClick: 6,
  slackPerFrame: 0.05,
  taskProb: 0.04,

  enableLogging: window.location.hostname !== 'localhost',
  debug: params.includes('debug'),
  forceGdpr: params.includes('gdpr'),
  perfectApplicant: params.includes('perfect'),
  startHighSchool: params.includes('highschool'),
  testGameOver: params.includes('gameover'),
  schoolSubsidies: params.includes('subsidy'),
  twoHops: params.includes('twoHops'),
  jobSatisfaction: params.includes('jobSatisfaction')
};
