import skills from '../data/skills.json'

class Skill {
  constructor(id, name, automatibility) {
    this.id = id;
    this.name = name;
    this.automatibility = automatibility;
  }
}

const Skills = Object.assign({}, ...Object.keys(skills).map(k => {
  let id = parseInt(k);
  let data = skills[k];
  let skill = new Skill(id, data.name, data.automatibility);
  return {[id]: skill};
}));

export default Skills;
