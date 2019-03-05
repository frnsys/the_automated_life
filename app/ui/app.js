import React, { Component } from 'react';
import Scene from './scene';
import HUD from './hud';
import Work from './work';
import Notifications from './notifs';
import { GlobalStyle, Button } from './styles'
import Modal from 'react-modal';
import StartMenu from './startMenu';
import Skills from './skills';
import School from './school';

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
      modal: StartMenu,
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
          <this.state.modal closeModal={this.closeModal} />
        </Modal>

        <HUD>
          <Button onClick={() => this.setState({modalIsOpen: true, modal: Skills})}>View Skills</Button>
          <Button onClick={() => this.setState({modalIsOpen: true, modal: School})}>School</Button>
        </HUD>
        <Work />

        <Scene />
      </div>
    );
  }
}

export default App;
