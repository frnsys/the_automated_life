import React, { Component } from 'react';
import Scene from './scene';
import HUD from './hud';
import Work from './work';
import {Notifications, Message, Content, Title, Body, history} from './notifs';
import { GlobalStyle, Button } from './styles'
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip'
import StartMenu from './startMenu';
import Skills from './skills';
import School from './school';
import styled from 'styled-components';
import config from 'config';
import log from 'log';

Modal.setAppElement('#main');
const customStyles = {
  overlay: {
    zIndex: 12
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

const GameOver = styled('div')`
  position: fixed;
  z-index: 100;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: rgba(0,0,0,0.75);
`
const GameOverAlert = styled('div')`
  margin: 8em auto;
  padding: 2em;
  background: #fff;
  max-width: 400px;
  h2 {
    margin-top: 0;
  }
`;

const GameOverSurveyStyle = styled('div')`
margin: 2em 0 0 0;
.form-field {
  margin: 0.5em 0;
}
label {
  display: block;
}
input {
  width: 100%;
  box-sizing: border-box;
}
input[type=submit] {
  border: none;
  background: #395be5;
  color: #fff;
  font-weight: bold;
  font-family: 'Arimo', 'Helvetiva', sans-serif;
  padding: 0.25em 0.5em;
  cursor: pointer;
}
`;

class GameOverSurvey extends Component {
  constructor() {
    super();
    this.state = {
      occupation: ''
    };
  }

  render() {
    return <GameOverSurveyStyle>
      <p>Thank you for playing Automation World.</p>
      <form onSubmit={(ev) => {ev.preventDefault(); log('survey', this.state); return false;}}>
        <div className="form-field">
          <label>Occupation</label>
          <input type='text' value={this.state.occupation} onChange={(ev) => this.setState({occupation: ev.target.value})} />
        </div>
        <input type='Submit' value='Submit' />
      </form>
    </GameOverSurveyStyle>
  }
}

const WorkArea = styled('div')`
  position: fixed;
  z-index: 11;
  right: 1em;
  top: 1em;
  color: #000;
  width: 17.1em;
`;

const HUDArea = styled('div')`
  position: fixed;
  z-index: 2;
  left: 1em;
  top: 1em;
  max-width: 220px;
`;


const OnboardingHint = styled('div')`
  background: #f6fc88;
  padding: 0.5em;
  border: 2px solid #b517ff;
  font-size: 0.9em;
`;

const PauseResumeButton = styled('div')`
  padding: 0.1em 0.5em;
  font-size: 0.8em;
  text-align: center;
  background: #395be5;
  color: #fff;
  font-weight: bold;
  display: inline-block;
  cursor: pointer;
  border: 2px solid black;
  border-bottom: none;
  box-sizing: border-box;
  width: 100%;
  &:hover {
    background: red;
  }
`

const NotificationHistoryButton = styled('div')`
  position: fixed;
  right: 1em;
  bottom: 1em;
  cursor: pointer;
  color: #888;
  text-decoration: underline;
  font-size: 0.8em;
  z-index: 10;
  background: #eee;
`;

const NotificationHistory = () => {
  return <div style={{width: '440px', height: '70vh', overflowY: 'scroll'}}>
    <h3>History</h3>
    {history.map((h, i) => {
      return <Message key={i} style={{width: '100%', fontSize: '0.8em'}}>
        <Content style={h.style}>
          <div>
            <Title>{h.title}</Title>
            {h.msg ? <Body>{h.msg}</Body> : ''}
          </div>
        </Content>
      </Message>
    })}
  </div>;
};

class App extends Component {
  constructor() {
    super();

    this.state = {
      started: false,
      modal: StartMenu,
      modalIsOpen: true,
      paused: true,
      gameOver: null
    };

    this.openModal = () => this.setState({modalIsOpen: true});
    this.closeModal = () => this.setState({modalIsOpen: false});

    // Hacky way to call game over
    window.gameOver = (gameOver) => this.setState({gameOver});
  }

  togglePause() {
    let paused = this.state.paused;
    window.paused = !paused;
    this.setState({ paused: !paused, started: true });
  }

  render() {
    // Kind of hacky way to make notifications accessible globally
    return (
      <div>
        <GlobalStyle />
        <ReactTooltip className='info-tooltip' />
        <Notifications children={add => (window.notify = add)} />

        {this.state.gameOver ?
          <GameOver>
            <GameOverAlert>
              <h2>{this.state.gameOver.icon} Game Over</h2>
              {this.state.gameOver.text}
              <GameOverSurvey />
            </GameOverAlert>
          </GameOver> : ''}

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          shouldCloseOnOverlayClick={!this.state.modal.requireChoice}
          contentLabel='Game Alert'>
          <this.state.modal closeModal={this.closeModal} />
        </Modal>

        {this.state.paused ?
            <OnboardingHint style={{position: 'fixed', right: '1em', bottom: '1em', zIndex: 11, maxWidth: '360px'}}>This is the job graph. Jobs are connected based on the similarity of their skills. The <b>blue</b> node is your current job. <br /><br /><b>Red</b> jobs are jobs you can <b>apply</b> to by clicking on them (it takes {config.applicationMinMonths} months to hear back). Your chance of getting hired depends on your relevant skill levels, your education, and your current job performance.<br /><br /><b>Yellow</b> jobs are jobs you've had previously. You can re-apply to them at any time.<br /><br />Mouse over a job to see its skill requirements, their risk of automation, and your current skill levels.</OnboardingHint> : ''}

        <HUDArea>
          <PauseResumeButton onClick={this.togglePause.bind(this)}>{this.state.paused ? (this.state.started ? 'Resume' : 'Start') : 'Pause'}</PauseResumeButton>
          <HUD>
            <Button onClick={() => this.setState({modalIsOpen: true, modal: Skills})}>Skills</Button>
            <Button onClick={() => this.setState({modalIsOpen: true, modal: School})}>School</Button>
          </HUD>
          {this.state.paused ? <OnboardingHint style={{marginTop: '0.1em'}}>Here you can see your current age, savings, income, expenses, education level, and job.<br /><br />The <b>Skills</b> menu will show you your skills, and the <b>School</b> menu is where you can enroll in school.</OnboardingHint>: ''}
        </HUDArea>

        <NotificationHistoryButton onClick={() => this.setState({modalIsOpen: true, modal: NotificationHistory})}>Notification history</NotificationHistoryButton>

        <WorkArea>
          <Work />
          {this.state.paused ? <OnboardingHint style={{marginTop: '0.1em'}}><b>Work tasks</b> will pile up here. Click to complete them and to increase your <b>performance</b> at your job. This affects your chance of getting hired at new jobs.</OnboardingHint> : ''}
        </WorkArea>

        <Scene />
      </div>
    );
  }
}

export default App;
