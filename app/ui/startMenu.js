import React, { Component } from 'react';
import loop from '../loop';
import graph from './3d/graph';
import config from 'config';
import store from '../store';
import jobs from 'data/jobs.json'
import styled from 'styled-components';
import { Button } from './styles'

const StartMenuStyle = styled('div')`
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .selected {
    background: #39e567;
    color: #fff;
  }

  li {
    cursor: pointer;
  }
`;

class StartMenu extends Component {
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
    this.props.closeModal();
  }

  render() {
    return <StartMenuStyle>
      <h3>Select your starting job</h3>
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
