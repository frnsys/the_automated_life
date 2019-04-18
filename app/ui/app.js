import t from 'i18n';
import config from 'config';
import HUD from './hud';
import Work from './work';
import Scene from './scene';
import Modal from 'react-modal';
import Skills from './skills';
import School from './school';
import StartMenu from './startMenu';
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip'
import {GameOver, GameOverSurvey} from './gameOver';
import {Notifications, Message, Content, Title, Body, history} from './notifs';
import { GlobalStyle, Button } from './styles'
import React, { Component } from 'react';

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

  &.graph-onboarding-hint {
    position: fixed;
    right: 1em;
    bottom: 1em;
    z-index: 11;
    max-width: 360px;
  }

  &.work-onboarding-hint {
    margin-top: 0.1em;
    position: absolute;
    top: 1.5em;
  }

  &.hud-onboarding-hint {
    margin-top: 0.1em;
  }
`;

const TimeControls = styled('div')`
  width: 100%;
  display: flex;
`;

const TimeButton = styled('div')`
  flex: 1;
  user-select: none;
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
  &:hover {
    background: red;
  }
  &:last-child {
    border-left: none;
  }
`

const NotificationHistoryStyle = styled('div')`
  width: 440px;
  height: 70vh;
  overflow-y: scroll;
`;

const NotificationHistoryButton = styled('div')`
  position: fixed;
  right: 1em;
  bottom: 0.2em;
  cursor: pointer;
  color: #888;
  text-decoration: underline;
  font-size: 0.8em;
  z-index: 10;
  background: #eee;
`;

const NotificationHistory = () => {
  return <NotificationHistoryStyle>
    <h3>{t('notification_history_title')}</h3>
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
  </NotificationHistoryStyle>;
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      started: false,
      modal: StartMenu,
      modalIsOpen: true,
      paused: true,
      speedup: window.speedup,
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

  toggleSpeed() {
    if (window.speedup < 1) {
      window.speedup = 1;
    } else if (window.speedup == 1) {
      window.speedup = 2;
    } else if (window.speedup == 2) {
      window.speedup = 4;
    } else if (window.speedup == 4) {
      window.speedup = 8;
    } else {
      window.speedup = 0.5;
    }
    this.setState({ speedup: window.speedup });
  }

  render() {
    // Kind of hacky way to make notifications accessible globally
    return (
      <div>
        <GlobalStyle />
        <ReactTooltip className='info-tooltip' />
        <Notifications children={add => (window.notify = add)} />

        {this.state.gameOver ? <GameOver {...this.state.gameOver} /> : ''}

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          shouldCloseOnEsc={!this.state.modal.requireChoice}
          shouldCloseOnOverlayClick={!this.state.modal.requireChoice}
          contentLabel='Game Alert'>
          <this.state.modal closeModal={this.closeModal} />
        </Modal>

        {this.state.paused ?
            <OnboardingHint className='graph-onboarding-hint'>
              <div dangerouslySetInnerHTML={{__html: t('hint_job_graph', {
                applicationMonths: config.applicationMinMonths
              })}}></div>
            </OnboardingHint> : ''}

        <HUDArea>
          <TimeControls>
            <TimeButton onClick={this.togglePause.bind(this)}>
              {this.state.paused ? (this.state.started ? t('resume_button') : t('start_button')) : t('pause_button')}
            </TimeButton>
            <TimeButton onClick={this.toggleSpeed.bind(this)}>🕛 {window.speedup}x</TimeButton>
          </TimeControls>
          <HUD>
            <Button onClick={() => this.setState({modalIsOpen: true, modal: Skills})}>{t('skills_button')}</Button>
            <Button onClick={() => this.setState({modalIsOpen: true, modal: School})}>{t('school_button')}</Button>
          </HUD>
          {this.state.paused ? <OnboardingHint className='hud-onboarding-hint'>
            <div dangerouslySetInnerHTML={{__html: t('hint_hud')}}></div>
          </OnboardingHint>: ''}
        </HUDArea>

        <NotificationHistoryButton onClick={() => this.setState({modalIsOpen: true, modal: NotificationHistory})}>
          {t('notification_history_button')}
        </NotificationHistoryButton>

        <WorkArea>
          <Work />
          {this.state.paused ? <OnboardingHint className='work-onboarding-hint'>
            <div dangerouslySetInnerHTML={{__html: t('hint_work')}}></div>
          </OnboardingHint> : ''}
        </WorkArea>

        <Scene />
      </div>
    );
  }
}

export default App;
