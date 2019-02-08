import math from 'mathjs';
import Skills from './skill.js';

// For weighted random sampling of skills
const skillWeights = Object.values(Skills).map(s => s.automatibility);

function randomSkills(n) {
  return math.pickRandom(Object.keys(Skills), skillWeights, n);
}


class Robot {
  static random() {
    let nSkills = math.random(2, 5);
    let skills = randomSkills(nSkills);
    let productivity = math.random();
    return new Robot(skills, productivity);
  }

  constructor(skills, productivity) {
    this.skills = skills;
    this.productivity = productivity;
  }
}

export default Robot;
