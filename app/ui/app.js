import React, { Component } from 'react';
import Scene from './scene';
import HUD from './hud';
import Work from './work';
import Notifications from './notifs';
import { GlobalStyle, Button } from './styles'
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip'
import StartMenu from './startMenu';
import Skills from './skills';
import School from './school';
import styled from 'styled-components';
import config from 'config';

Modal.setAppElement('#main');
const customStyles = {
  overlay: {
    zIndex: 10
  },
  content: {
    border: '4px solid black',
    borderRadius: 0,
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '480px'
  }
};


const WorkArea = styled('div')`
  position: fixed;
  z-index: 9;
  right: 1em;
  top: 1em;
  color: #000;
  max-width: 280px;
`;

const HUDArea = styled('div')`
  position: fixed;
  z-index: 2;
  left: 1em;
  top: 1em;
  max-width: 200px;
`;


const OnboardingHint = styled('div')`
  background: #f6fc88;
  padding: 0.5em;
  border: 2px solid #b517ff;
  font-size: 0.9em;
`;

const PauseResume = styled('div')`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1em;
  text-align: center;
`

const PauseResumeButton = styled('div')`
  padding: 0.25em 0.5em;
  text-align: center;
  background: red;
  color: #fff;
  font-weight: bold;
  display: inline-block;
  cursor: pointer;
  border: 2px solid black;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
`

class App extends Component {
  constructor() {
    super();

    this.state = {
      modal: StartMenu,
      modalIsOpen: true,
      paused: true
    };

    this.openModal = () => this.setState({modalIsOpen: true});
    this.closeModal = () => this.setState({modalIsOpen: false});
  }

  togglePause() {
    let paused = this.state.paused;
    window.paused = !paused;
    this.setState({ paused: !paused });
  }

  render() {
    // Kind of hacky way to make notifications accessible globally
    return (
      <div>
        <GlobalStyle />
        <ReactTooltip className='info-tooltip' />
        <Notifications children={add => (window.notify = add)} />

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          shouldCloseOnOverlayClick={!this.state.modal.requireChoice}
          contentLabel='Game Alert'>
          <this.state.modal closeModal={this.closeModal} />
        </Modal>

        {this.state.paused ?
          <OnboardingHint style={{position: 'fixed', left: '300px', top: '1em', zIndex: 2, maxWidth: '360px'}}>This is the job graph. The <b>blue</b> node is your current job. <b>Yellow</b> jobs are jobs you've had previously.<br /><br /><b>Red</b> jobs are jobs you can <b>apply</b> to by clicking on them (it takes {config.applicationMinMonths} months to hear back). Your chance of getting hired depends on your relevant skill levels, your education, and your current job performance.<br /><br />Mouse over a job to see its skill requirements, their risk of automation, and your current skill levels.</OnboardingHint> : ''}

        <HUDArea>
          <HUD>
            <Button onClick={() => this.setState({modalIsOpen: true, modal: Skills})}>Skills</Button>
            <Button onClick={() => this.setState({modalIsOpen: true, modal: School})}>School</Button>
          </HUD>
          {this.state.paused ? <OnboardingHint style={{marginTop: '0.1em'}}>Here you can see your current age, savings, income, expenses, education level, and job.<br /><br />The <b>Skills</b> menu will show you your skills, and the <b>School</b> menu is where you can enroll in school.</OnboardingHint>: ''}
        </HUDArea>


        <WorkArea>
          <Work />
          {this.state.paused ? <OnboardingHint style={{marginTop: '0.1em'}}>Press the <b>WORK</b> button to increase your <b>performance</b> at your job. This affects your chance of getting hired at new jobs.</OnboardingHint> : ''}
        </WorkArea>

        <PauseResume>
          <PauseResumeButton onClick={this.togglePause.bind(this)}>{this.state.paused ? 'Resume' : 'Pause'}</PauseResumeButton>
        </PauseResume>

        <Scene />
      </div>
    );
  }
}

export default App;
