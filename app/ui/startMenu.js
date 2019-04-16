import t from 'i18n';
import log from 'log';
import React, { Component } from 'react';
import loop from '../loop';
import graph from './3d/graph';
import config from 'config';
import store from 'store';
import jobs from 'data/jobs.json'
import styled from 'styled-components';
import { Button } from './styles'

const StartMenuStyle = styled('div')`
  h2 {
    margin: 0;
  }
  h3 {
    margin-bottom: 0;
  }
  ul {
    margin: 0.5em 0 1em;
  }

  .selected {
    background: #39e567;
  }

  li {
    cursor: pointer;
    padding: 0.2em;
  }
`;

class StartMenu extends Component {
  static requireChoice = true;

  constructor(props) {
    super(props);
    this.state = {
      selectedJob: config.startingJobs[0]
    };
  }

  startGame() {
    store.dispatch({
      type: 'player:hire',
      payload: jobs[this.state.selectedJob]
    });
    graph.reveal(this.state.selectedJob, true);
    loop();
    window.paused = true;
    log('started', {job: this.state.selectedJob});
    this.props.closeModal();
  }

  render() {
    return <StartMenuStyle>
      <h2>{t('start_welcome')}</h2>
      <p>{t('start_intro')}</p>
      <p><b><u>{t('start_goal', {age: config.retirementAge, savings: config.retirementSavingsMin.toLocaleString()})}</u></b></p>
      <h3>{t('select_starting_job')}:</h3>
      <ul>
        {config.startingJobs.map((id) => {
          return <li
            key={id}
            onClick={() => this.setState({selectedJob: id})}
            className={this.state.selectedJob == id ? 'selected' : ''}>{jobs[id].name}</li>;
        })}
      </ul>
      <Button onClick={this.startGame.bind(this)}>{t('select_starting_job_button')}</Button>
    </StartMenuStyle>
  }
}

export default StartMenu;
