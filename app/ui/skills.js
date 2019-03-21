import {connect} from 'react-redux';
import React, { Component } from 'react';
import styled from 'styled-components';
import { Bar, BarFill } from './styles'
import skills from 'data/skills.json'
import logic from '../logic';

const SkillsStyle = styled('div')`
  max-height: 80vh;
  table {
    max-width: 460px;
  }
  tr:nth-child(odd) {
    background: #eee;
  }
`;

class Skills extends Component {
  render() {
    let skillChanges = logic.workSkillGain(this.props.job, 1);
    let changingSkills = Object.keys(skillChanges);

    return <SkillsStyle>
      <h3>Your Skills</h3>
      <table>
        <tbody>
          {Object.keys(this.props.skills).map((s_id) => {
            return <tr key={s_id}>
              <td>{changingSkills.includes(s_id) ? <img title="Improving on this job" alt="Improving on this job" src="/arrow.png" style={{width: '12px'}} /> : ''} {skills[s_id].name}</td>
              <td><Bar style={{width: '3em', height: '1.5em', background: 'none'}}><BarFill style={{width: `${this.props.skills[s_id]*100}%`}} /></Bar></td></tr>;
          })}
        </tbody>
      </table>
    </SkillsStyle>
  }
}

const mapStateToProps = (state, props) => {
  return {
    job: state.player.job,
    skills: state.player.skills
  };
};

export default connect(mapStateToProps)(Skills);
