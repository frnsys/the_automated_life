import t from 'i18n';
import {connect} from 'react-redux';
import React, { Component } from 'react';
import skills from 'data/skills.json'
import skillGroups from 'data/skillGroups.json'
import logic from '../logic';

const improvingArrow = <img title={t('improving_on_job')} alt={t('improving_on_job')} src="/static/arrow.png" />;

const SkillsLegend = () => {
  return (
    <div className="skills-legend">
      <div className="automation-legend">
        <div className="automation-low-key"></div> {t('low_risk_automation')}
        <div className="automation-moderate-key"></div> {t('mid_risk_automation')}
        <div className="automation-high-key"></div> {t('high_risk_automation')}
      </div>
      <div>
        {improvingArrow} {t('improving_skill')}
      </div>
      <div className="skill-legend">
        <div className="skill-level-bar"><div className="skill-level-bar-fill"></div></div> {t('your_skill_level')}
      </div>
    </div>);
}


const Skill = (props) => {
  let s_id = props.s_id;
  let s = skills[s_id];
  let risk = t('low');
  if (s.automatibility >= 0.7) {
    risk = t('high');
  } else if (s.automatibility >= 0.4) {
    risk = t('moderate');
  }
  return <li className={`automation-${risk}`} key={s_id}>
    {props.automated ? <div className="automated"><div>{t('automated')}</div></div> : ''}
    {props.improving ? improvingArrow : ''}
    {t(s.name)}
    <div className="skill-level-bar">
      <div className="skill-level-bar-fill" style={{height:`${props.skills[s.id] * 100}%`}}></div>
    </div>
  </li>;
}

class Skills extends Component {
  render() {
    let skillChanges = this.props.job.skills ? logic.workSkillGain(this.props.job, 1) : {};
    let changingSkills = Object.keys(skillChanges);
    let robotSkills = Object.keys(skills).filter((s_id) => skills[s_id].automatibility == 0);
    let automatedSkills = Object.values(this.props.robots).reduce((acc, r) => {
      return acc.concat(r.skills);
    }, []);

    return <div className='skills'>
      <SkillsLegend />
      <div className="skills-list">
        <h3>{t('your_skills')}</h3>
        <h5>{t('percent_skills_automated', {
          percent: ((automatedSkills.length/Object.keys(skills).length)*100).toFixed(1)
        })}</h5>
        <p className="skills-info">{t('skills_info')}</p>
        {skillGroups.map((group) => {
          return (<div key={group.name}>
            <h4>{t(group.name)}</h4>
            <ul className="skill-group">
              {group.skills.map((s_id) => <Skill s_id={s_id}
                skills={this.props.skills}
                improving={changingSkills.includes(s_id.toString())}
                automated={automatedSkills.includes(s_id)}/>)}
            </ul>
          </div>);
        })}
        {robotSkills.length > 0 ? <div>
          <h4>{t('robot_maintenance')}</h4>
          <ul className="skill-group">
            {robotSkills.map((s_id) => <Skill s_id={s_id}
                skills={this.props.skills}
                improving={changingSkills.includes(s_id.toString())}
                automated={automatedSkills.includes(s_id)}/>)}
          </ul>
        </div> : ''}
      </div>
    </div>
  }
}

const mapStateToProps = (state, props) => {
  return {
    job: state.player.job,
    skills: state.player.skills,
    robots: state.robots
  };
};

export default connect(mapStateToProps)(Skills);
