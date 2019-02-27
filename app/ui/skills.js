import {connect} from 'react-redux';
import React, { Component } from 'react';
import styled from 'styled-components';
import { Button, Bar, BarFill } from './styles'
import store from 'store';
import skills from 'data/skills.json'

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
  startTraining(s_id) {
    store.dispatch({
      type: 'player:startTraining',
      payload: s_id
    });
  }

  render() {
    return <SkillsStyle>
      <h3>Your Skills</h3>
      {this.props.training ? `Currently training ${skills[this.props.training.skill].name} (${this.props.countdown} months left)` : ''}
      <table>
        <tbody>
          {Object.keys(this.props.skills).map((s_id) => {
            let trainingSkill = this.props.training && this.props.training.skill == s_id;
            return <tr key={s_id}>
              <td><Button
                  disabled={this.props.training}
                  highlight={trainingSkill}
                  onClick={() => this.startTraining(s_id)}
              >{ trainingSkill ? "Training" : "Train"}</Button></td>
              <td>{skills[s_id].name}</td>
              <td><Bar style={{width: '3em', height: '1.5em', background: 'none'}}><BarFill style={{width: `${this.props.skills[s_id]*100}%`}} /></Bar></td></tr>;
          })}
        </tbody>
      </table>
    </SkillsStyle>
  }
}

const mapStateToProps = (state, props) => {
  return {
    skills: state.player.skills,
    training: state.player.training,
    countdown: state.player.training ? state.player.training.countdown : -1
  };
};

export default connect(mapStateToProps)(Skills);
