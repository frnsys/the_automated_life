const params = location.search.slice(1);

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let startingJobs = [643, 721, 333, 717];
// let startingJobs = [147]; // Utilities
// let startingJobs = [17]; // Transportation and Warehousing
// let startingJobs = [13]; // Agriculture, Forestry, Fishing, and Hunting
// let startingJobs = [48]; // Retail Trade
// let startingJobs = [158]; // Real Estate and Rental and Leasing
// let startingJobs = [0]; // Professional, Scientific, and Technical Services
// let startingJobs = [49]; // Other Services (Except Public Administration)
// let startingJobs = [146]; // Mining, Quarrying, and Oil and Gas Extraction
// let startingJobs = [2]; // Manufacturing
// let startingJobs = [123]; // Management of Companies and Enterprises
// let startingJobs = [7]; // Information
// let startingJobs = [22]; // Health Care and Social Assistance'
// let startingJobs = [1]; // Finance and Insurance
// let startingJobs = [4]; // Educational Services
// let startingJobs = [66]; // Construction
// let startingJobs = [10]; // Arts, Entertainment, and Recreation
// let startingJobs = [59]; // Administrative and Support Services
// let startingJobs = [53]; // Accommodation and Food Services
shuffle(startingJobs);

export default {
  startYear: 2019,
  secPerMonth: 5,
  schoolTimeSpeedup: 25,

  // Using data for 1 adult across NY state from:
  // <http://livingwage.mit.edu/states/36>
  monthlyExpenses: 2200,

  minRetirementAge: 30,
  minRetirementAgeSavingsMin: 2e6,
  retirementAge: 60,
  retirementSavingsMin: 500000,
  gameOverBalance: -100000,
  deepeningAutomationAlpha: 0.05,
  inflation: 0.015,
  newRobotSkillMinImportance: 0.03,
  newRobotWarningMonths: 8,
  startingJobs: startingJobs,
  applicationMinMonths: 2,
  loanTerms: {
    interestRate: 0.058,
    years: 10
  },
  subsidyPercent: 0.5,

  industryIcons: {
    'Professional, Scientific, and Technical Services': '🔬',
    'Finance and Insurance': '💵',
    'Manufacturing': '🏭',
    'Government': '🏛️',
    'Educational Services': '📚',
    'Health Care and Social Assistance': '🏥',
    'Information': '🖥️',
    'Arts, Entertainment, and Recreation': '🎭',
    'Agriculture, Forestry, Fishing, and Hunting': '🌲',
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
  baseWorkPerClick: 8,
  slackPerFrame: 0.025,
  maxTasks: 40,
  taskProb: 0.125,
  taskColors: [
    '#EA432A',
    '#666df9',
    '#06c943',
    '#a414e2'
  ],
  maxBadPerformanceStreak: 4, // in months, after which player is fired

  enableLogging: window.location.hostname !== 'localhost' || params.includes('log'),
  debug: params.includes('debug'),
  forceGdpr: params.includes('gdpr'),
  perfectApplicant: params.includes('perfect'),
  startHighSchool: params.includes('highschool'),
  testGameOver: params.includes('gameover'),
  schoolSubsidies: params.includes('subsidy'),
  twoHops: params.includes('twoHops'),
  jobSatisfaction: params.includes('jobSatisfaction'),

  tutorials: [{
    // Start of game
    name: 'start',
    trigger: (state) => true,
    tooltips: [{
      position: (player, graph) => {
        let node = graph.nodes[player.job.id];
        return {
          top: `${-node.y+10}px`,
          left: `${node.x * (node.x > 0 ? 1.04 : 1.01)}px`
        };
      },
      text: 'tutorial_welcome',
      parent: '#annotations',
      onStart: () => {
        // Effectively pause the game, but running so tasks register
        window.paused = false;
        window.speedup = 0.00001;
      },
      onCompletion: (store) => {
        store.dispatch({
          type: 'player:newTask',
          payload: 4
        });
        document.querySelector('.work-area').style.display = 'block';
      }
    }, {
      position: {
        top: '0px',
        right: '110%'
      },
      text: 'tutorial_work',
      parent: '.work-area',
    }, {
      position: {
        top: '0px',
        right: '110%'
      },
      text: 'tutorial_performance',
      parent: '.work-area',
      onCompletion: (store) => {
        store.dispatch({
          type: 'player:newTask',
          payload: 12
        });
      }
    }]
  }, {

    // After achieving fantastic performance
    name: 'job_application',
    delay: 1,
    trigger: (state) => state.player.performance > 80,
    tooltips: [{
      position: (player, graph) => {
        let node = graph.nodes[player.job.id];
        return {
          top: `${-node.y-30}px`,
          left: `${node.x * (node.x > 0 ? 1.04 : 1.01)}px`
        };
      },
      text: 'tutorial_jobs',
      parent: '#annotations',
      onStart: (store, graph) => {
        let {player} = store.getState();
        graph.reveal(player.job.id, {center: true, fit: false});

        // Special flag to fast track the job application
        // and ensure the player is hired
        window.fasttrack = true;
      },
      onCompletion: (store, graph) => {
        let {player} = store.getState();
        graph.reveal(player.job.id, {center: true, fit: false});
      },
    }, {
      position: (player, graph) => {
        let node = graph.nodes[player.job.id];
        return {
          top: `${-node.y+10}px`,
          left: `${node.x * (node.x > 0 ? 1.04 : 1.01)}px`
        };
      },
      text: 'tutorial_apply',
      parent: '#annotations',
    }]
  }, {

    // After getting hired at second new job
    name: 'game_objective',
    delay: 4,
    trigger: (state) => state.player.pastJobs.length > 1,
    tooltips: [{
      position: {
        top: '0px',
        left: '110%'
      },
      text: 'tutorial_hud',
      parent: '.hud-area',
      onStart: (store) => {
        document.querySelector('.hud-area').style.display = 'block';
        document.querySelector('.hud-children').style.display = 'none';
      },
      onCompletion: () => {
        window.speedup = 1;
        window.updateSpeed(window.speedup);
        window.updatePaused(true);
        document.querySelector('.hud-area').style.display = 'block';
        document.querySelector('.hud-children').style.display = 'none';
        document.querySelector('.hud-children .button:first-child').style.visibility = 'hidden';
        document.querySelector('.hud-children .button:last-child').style.visility = 'hidden';
      }
    }, {
      position: {
        top: '0px',
        left: '110%'
      },
      text: 'tutorial_expenses',
      parent: '.hud-area',
      onCompletion: () => {
        document.querySelector('.hud-progress').style.display = 'block';
        window.updatePaused(false);
      }
    }, {
      // Explain game objective
      position: {
        bottom: '0px',
        left: '110%'
      },
      text: 'tutorial_goal',
      parent: '.hud-progress'
    }, {
      position: {
        bottom: '0px',
        left: '110%'
      },
      text: 'tutorial_lose',
      parent: '.hud-progress',
      onCompletion: () => {
        document.querySelector('.time-controls').style.display = 'flex';
      }
    }, {
      position: {
        top: '0px',
        left: '110%'
      },
      text: 'tutorial_pause',
      parent: '.hud-area'
    }]
  }, {

    // After first robot releases
    name: 'automation',
    trigger: (state) => Object.keys(state.robots).length > 0,
    tooltips: [{
      position: {
        top: '0px',
        left: '110%'
      },
      text: 'tutorial_automation',
      parent: '.hud-area'
      onStart: (store, graph) => {
        window.updatePaused(true);
      }
    }, {
      position: {
        top: '0px',
        left: '110%'
      },
      text: 'tutorial_risk',
      parent: '.hud-area'
    }]
  }, {

    // After first education-related rejection
    name: 'education',
    trigger: (state) => state.player.lastRejectionReason == 'education',
    tooltips: [{
      position: {
        top: '0px',
        left: '110%'
      },
      text: 'tutorial_education_rejected',
      parent: '.hud-area',
      onStart: () => {
        window.updatePaused(true);
      },
      onCompletion: () => {
        document.querySelector('.hud-children').style.display = 'flex';
        document.querySelector('.hud-children .button:first-child').style.visibility = 'visible';
      }
    }, {
      position: {
        top: '0px',
        left: '110%'
      },
      text: 'tutorial_education',
      parent: '.hud-area'
    }]
  }, {

    // After first skill-related rejection
    name: 'skills',
    trigger: (state) => state.player.lastRejectionReason == 'skills',
    tooltips: [{
      position: {
        top: '0px',
        left: '110%'
      },
      text: 'tutorial_skills_rejected',
      parent: '.hud-area',
      onStart: () => {
        window.updatePaused(true);
      },
      onCompletion: () => {
        document.querySelector('.hud-children').style.display = 'flex';
        document.querySelector('.hud-children .button:last-child').style.visibility = 'visible';
      }
    }, {
      position: {
        top: '0px',
        left: '110%'
      },
      text: 'tutorial_skills',
      parent: '.hud-area'
    }]
  }]
};
