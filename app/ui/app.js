import React, { Component } from 'react';
import Scene from './scene';
import HUD from './hud';
import Work from './work';
import School from './school';
import Notifications from './notifs';
import { GlobalStyle } from './styles'
import Modal from 'react-modal';

import loop from '../loop';
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

Modal.setAppElement('#main');

const customStyles = {
  overlay: {
    zIndex: 10
  },
  content: {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

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

class App extends Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: true
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  render() {
    // Kind of hacky way to make notifications accessible globally
    return (
      <div>
        <GlobalStyle />
        <Notifications children={add => (window.notify = add)} />

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel='Game Alert'>
          <StartMenu closeModal={this.closeModal} />
        </Modal>

        <HUD />

        <Scene />

        <Work />
        <School />
      </div>
    );
  }
}

export default App;
