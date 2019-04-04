import {connect} from 'react-redux';
import React, { Component } from 'react';
import styled from 'styled-components';
import { Bar, BarFill } from './styles'
import skills from 'data/skills.json'
import skillGroups from 'data/skillGroups.json'
import logic from '../logic';

const SkillsStyle = styled('div')`
  max-height: 80vh;
  overflow-y: scroll;
  padding: 1em;
  padding-bottom: 4em;

  .skill-group {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .skill-group::after {
    content: '';
    width: 32%;
  }
  .skill-group li {
    font-size: 0.9em;
    padding: 0.2em;
    padding-right: 8px;
    width: 32%;
    box-sizing: border-box;
    background: #eee;
    margin-bottom: 0.5em;
    position: relative;
    word-wrap: break-word;
  }
  h4 {
    background: #111;
    color: #fff;
    padding: 0.3em;
    margin-bottom: 0.5em;
  }

  > *:last-child {
    margin-bottom: 4em;
  }
`;

class Skills extends Component {
  render() {
    let skillChanges = logic.workSkillGain(this.props.job, 1);
    let changingSkills = Object.keys(skillChanges);
    let robotSkills = Object.keys(skills).filter((s_id) => skills[s_id].automatibility == 0);
    let automatedSkills = Object.values(this.props.robots).reduce((acc, r) => {
      return acc.concat(r.skills);
    }, []);

    return <div style={{padding: 0}}>
      <div className="skills-legend">
        <div className="automation-legend">
          <div className="automation-low-key"></div> low risk
          <div className="automation-moderate-key"></div> mid risk
          <div className="automation-high-key"></div> high risk
        </div>
        <div>
          <img title="Improving on this job" alt="Improving on this job" src="/static/arrow.png" style={{width: '10px', margin: '0 2px'}} /> improving skill
        </div>
        <div className="skill-legend">
          <div className="skill-level-bar"><div className="skill-level-bar-fill"></div></div> your skill level
        </div>
      </div>
      <SkillsStyle>
        <h3>Your Skills</h3>
        {skillGroups.map((group) => {
          return (<div key={group.name}>
            <h4>{group.name}</h4>
            <ul className="skill-group">
              {group.skills.map((s_id) => {
                let s = skills[s_id];
                let risk = 'low';
                if (s.automatibility >= 0.7) {
                  risk = 'high';
                } else if (s.automatibility >= 0.4) {
                  risk = 'moderate';
                }
                return <li className={`automation-${risk}`} key={s_id}>
                  {automatedSkills.includes(s.id) ? <div className="automated"><div>Automated</div></div> : ''}
                  {changingSkills.includes(s_id.toString()) ? <img title="Improving on this job" alt="Improving on this job" src="/static/arrow.png" style={{width: '10px', margin: '0 2px'}} /> : ''}
                  {s.name}
                  <div className="skill-level-bar">
                    <div className="skill-level-bar-fill" style={{height:`${this.props.skills[s.id] * 100}%`}}></div>
                  </div>
                </li>;
              })}
            </ul>
          </div>);
        })}
        {robotSkills.length > 0 ? <div>
          <h4>Robot Maintenance</h4>
          <ul className="skill-group">
            {robotSkills.map((s_id) => {
                let s = skills[s_id];
                let risk = 'low';
                return <li className={`automation-${risk}`} key={s_id}>
                  {automatedSkills.includes(s.id) ? <div className="automated"><div>Automated</div></div> : ''}
                  {changingSkills.includes(s_id.toString()) ? <img title="Improving on this job" alt="Improving on this job" src="/static/arrow.png" style={{width: '10px', margin: '0 2px'}} /> : ''}
                  {s.name}
                  <div className="skill-level-bar">
                    <div className="skill-level-bar-fill" style={{height:`${(this.props.skills[s.id] || 0) * 100}%`}}></div>
                  </div>
                </li>;
            })}
          </ul>
        </div> : ''}
      </SkillsStyle>
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
