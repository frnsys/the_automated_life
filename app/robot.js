import math from 'mathjs';
import skills from '../data/skills.json'

// For weighted random sampling of skills
const skillWeights = Object.values(skills).map(s => s.automatibility);

function randomSkills(n) {
  return math.pickRandom(Object.keys(skills), skillWeights, n);
}

// Create a random robot
function createRobot() {
  let nSkills = math.random(2, 5);
  let skills = randomSkills(nSkills);
  let productivity = math.random();
  let id = math.randomInt(0, 1000); // TODO proper id system
  return { id, skills, productivity };
}

export default createRobot;
