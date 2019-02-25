import React, { Component } from 'react';
import Scene from './scene';
import HUD from './hud';
import Work from './work';
import School from './school';
import Notifications from './notifs';
import { GlobalStyle } from './styles'
import Modal from 'react-modal';
import StartMenu from './startMenu';

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

class App extends Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: true
    };

    this.openModal = () => this.setState({modalIsOpen: true});
    this.closeModal = () => this.setState({modalIsOpen: false});
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
        <Work />
        <School />

        <Scene />
      </div>
    );
  }
}

export default App;
