import log from '../log';
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
    log('started')
    this.props.closeModal();
  }

  render() {
    return <StartMenuStyle>
      <h2>Welcome to Automation World!</h2>
      <p>This game is an exploration of job mobility against the proliferation of automation. Your starting job has a high risk of automation. Try to end up in a job that is relatively safe from automation.</p>
      <p><b><u>Your goal is to retire at age {config.retirementAge} with a nest egg of ${config.retirementSavingsMin.toLocaleString()}.</u></b></p>
      <h3>Select your starting job:</h3>
      <ul>
        {config.startingJobs.map((id) => {
          return <li
            key={id}
            onClick={() => this.setState({selectedJob: id})}
            className={this.state.selectedJob == id ? 'selected' : ''}>{jobs[id].name}</li>;
        })}
      </ul>
      <Button onClick={this.startGame.bind(this)}>Start Game</Button>
    </StartMenuStyle>
  }
}

export default StartMenu;
