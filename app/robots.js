import math from 'mathjs';
import jobs from '../data/jobs.json'
import skills from '../data/skills.json'
import industries from '../data/industries.json';

const nameLength = 6;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

function reducer(state={}, action) {
  switch (action.type) {
    case 'robot:create':
      let robot = action.payload;
      state[id] = robot;
      return {...state};
    case 'robot:countdown':
      Object.values(state).forEach((r) => {
        r.countdown = Math.max(0, r.countdown - action.payload);
      });
      return {...state};
    case 'robot:deepened':
      let id = action.payload;
      state[id].deepened = true;
      return {...state};
  }
  return state;
}

// For weighted random sampling of skills
let remainingSkills = [...Object.keys(skills)];

function randomSkills(n) {
  let skillWeights = remainingSkills.map(s_id => skills[s_id].automatibility);
  return math.pickRandom(remainingSkills, skillWeights, n);
}

// Create a random robot
function create() {
  let nSkills = math.random(1, 3);
  let skills = randomSkills(nSkills);
  remainingSkills = remainingSkills.filter(s_id => !skills.includes(s_id));

  let efficiency = math.random();
  let id = math.randomInt(0, 1000); // TODO proper id system
  let name = [...Array(nameLength)].map(_ => math.pickRandom(chars)).join('');

  // Precompute & cache
  let industryWeights = {};
  Object.keys(industries).forEach((ind) => {
    industryWeights[ind] = industries[ind].reduce((acc, job_id) => {
      let job = jobs[job_id];
      return acc + skills.reduce((acc, id) => acc + (job.skills[id] || 0), 0);
    }, 0);
  });

  // Countdown to deepening automation
  // should be in ms
  let countdown = math.random(1*60*1000, 10*60*1000);
  let deepened = false;

  return { id, name, skills, efficiency, countdown, deepened, industryWeights };
}

export default { create, reducer, initialState: [] };
