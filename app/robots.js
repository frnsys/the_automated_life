import math from 'mathjs';
import skills from '../data/skills.json'

const nameLength = 6;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

function reducer(state=[], action) {
  switch (action.type) {
    case 'robot:create':
      state.push(action.payload);
      return [...state];
  }
  return state;
}

// For weighted random sampling of skills
const skillWeights = Object.values(skills).map(s => s.automatibility);

function randomSkills(n) {
  return math.pickRandom(Object.keys(skills), skillWeights, n);
}

// Create a random robot
function create() {
  let nSkills = math.random(2, 5);
  let skills = randomSkills(nSkills);
  let efficiency = math.random();
  let id = math.randomInt(0, 1000); // TODO proper id system
  let name = [...Array(nameLength)].map(_ => math.pickRandom(chars)).join('');
  return { id, name, skills, efficiency };
}

export default { create, reducer, initialState: [] };
