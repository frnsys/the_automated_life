import t from 'i18n';
import React, { Component } from 'react';
import Scene from './scene';
import HUD from './hud';
import Work from './work';
import {Notifications, Message, Content, Title, Body, history} from './notifs';
import { GlobalStyle, Button } from './styles'
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip'
import {RadioGroup, Radio} from 'react-radio-group'
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
  margin: 2em auto;
  padding: 2em;
  background: #fff;
  max-width: 600px;
  h2 {
    margin-top: 0;
  }
`;

const GameOverSurveyStyle = styled('div')`
border-top: 1px solid black;
margin: 2em 0 0 0;
.form-field {
  margin: 0.5em 0 1em 0;
}
label {
  display: block;
  font-weight: bold;
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
  font-family: 'Arimo', 'Helvetica', sans-serif;
  padding: 0.25em 0.5em;
  cursor: pointer;
}
.form-radio-group {
  display: flex;
  > div {
    flex: initial
    margin-right: 1em
  }
  label, input {
    display: inline;
    width: auto;
    font-weight: normal;
  }
}
`;

class GameOverSurvey extends Component {
  constructor() {
    super();
    this.state = {
      submitted: false,
      occupation: '',
      age: 0,
      education: 0,
      automation_social: 2,
      automation_individual: 2
    };
  }

  submit(ev) {
    ev.preventDefault();
    log('survey', this.state);
    this.setState({submitted: true});
    return false;
  }

  render() {
    return <GameOverSurveyStyle>
      <p>{t('game_over_thanks')}</p>
      {this.state.submitted ? <p>{t('survey_submitted')}</p> :
        <form onSubmit={(ev) => this.submit(ev)}>
          <div className="form-field">
            <label>{t('survey_age_label')}</label>
            <RadioGroup className='form-radio-group' name='age' selectedValue={this.state.age} onChange={(age) => this.setState({age})}>
              <div><Radio value={0} id='age_0' /><label htmlFor='age_0'>&lt;18</label></div>
              <div><Radio value={1} id='age_1' /><label htmlFor='age_1'>18-29</label></div>
              <div><Radio value={2} id='age_2' /><label htmlFor='age_2'>30-44</label></div>
              <div><Radio value={3} id='age_3' /><label htmlFor='age_3'>45-64</label></div>
              <div><Radio value={4} id='age_4' /><label htmlFor='age_4'>65+</label></div>
            </RadioGroup>
          </div>
          <div className="form-field">
            <label>{t('survey_education_label')}</label>
            <RadioGroup className='form-radio-group' name='education' selectedValue={this.state.education} onChange={(education) => this.setState({education})}>
              <div><Radio value={0} id='edu_0' /><label htmlFor='edu_0'>Some high school</label></div>
              <div><Radio value={1} id='edu_1' /><label htmlFor='edu_1'>High school</label></div>
              <div><Radio value={2} id='edu_2' /><label htmlFor='edu_2'>Bachelors</label></div>
              <div><Radio value={3} id='edu_3' /><label htmlFor='edu_3'>Masters</label></div>
              <div><Radio value={4} id='edu_4' /><label htmlFor='edu_4'>PhD</label></div>
            </RadioGroup>
          </div>
          <div className="form-field">
            <label>{t('survey_occupation_label')}</label>
            <input type='text' value={this.state.occupation} onChange={(ev) => this.setState({occupation: ev.target.value})} />
          </div>
          <div className="form-field">
            <label>{t('survey_automation_society_question')}</label>
            <RadioGroup className='form-radio-group' name='automation_social' selectedValue={this.state.automation_social} onChange={(automation_social) => this.setState({automation_social})}>
              <div><Radio value={0} id='soc_0' /><label htmlFor='soc_0'>{t('likert_0')}</label></div>
              <div><Radio value={1} id='soc_1' /><label htmlFor='soc_1'>{t('likert_1')}</label></div>
              <div><Radio value={2} id='soc_2' /><label htmlFor='soc_2'>{t('likert_2')}</label></div>
              <div><Radio value={3} id='soc_3' /><label htmlFor='soc_3'>{t('likert_3')}</label></div>
              <div><Radio value={4} id='soc_4' /><label htmlFor='soc_4'>{t('likert_4')}</label></div>
            </RadioGroup>
          </div>
          <div className="form-field">
            <label>{t('survey_automation_individual_question')}</label>
            <RadioGroup className='form-radio-group' name='automation_individual' selectedValue={this.state.automation_individual} onChange={(automation_individual) => this.setState({automation_individual})}>
              <div><Radio value={0} id='ind_0' /><label htmlFor='ind_0'>{t('likert_0')}</label></div>
              <div><Radio value={1} id='ind_1' /><label htmlFor='ind_1'>{t('likert_1')}</label></div>
              <div><Radio value={2} id='ind_2' /><label htmlFor='ind_2'>{t('likert_2')}</label></div>
              <div><Radio value={3} id='ind_3' /><label htmlFor='ind_3'>{t('likert_3')}</label></div>
              <div><Radio value={4} id='ind_4' /><label htmlFor='ind_4'>{t('likert_4')}</label></div>
            </RadioGroup>
          </div>
          <input type='Submit' value={t('survey_submit_button')} />
        </form>}
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

const TimeControls = styled('div')`
  width: 100%;
  display: flex;
`;
const PauseResumeButton = styled('div')`
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
  return <div style={{width: '440px', height: '70vh', overflowY: 'scroll'}}>
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

        {this.state.gameOver ?
          <GameOver>
            <GameOverAlert>
              <h2>{this.state.gameOver.icon} {t('game_over_notice')}</h2>
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
            <OnboardingHint style={{position: 'fixed', right: '1em', bottom: '1em', zIndex: 11, maxWidth: '360px'}}><div dangerouslySetInnerHTML={{__html: t('hint_job_graph', {applicationMonths: config.applicationMinMonths})}}></div></OnboardingHint> : ''}

        <HUDArea>
          <TimeControls>
            <PauseResumeButton onClick={this.togglePause.bind(this)}>{this.state.paused ? (this.state.started ? t('resume_button') : t('start_button')) : t('pause_button')}</PauseResumeButton>
            <PauseResumeButton onClick={this.toggleSpeed.bind(this)}>{window.speedup}x</PauseResumeButton>
          </TimeControls>
          <HUD>
            <Button onClick={() => this.setState({modalIsOpen: true, modal: Skills})}>{t('skills_button')}</Button>
            <Button onClick={() => this.setState({modalIsOpen: true, modal: School})}>{t('school_button')}</Button>
          </HUD>
          {this.state.paused ? <OnboardingHint style={{marginTop: '0.1em'}}><div dangerouslySetInnerHTML={{__html: t('hint_hud')}}></div></OnboardingHint>: ''}
        </HUDArea>

        <NotificationHistoryButton onClick={() => this.setState({modalIsOpen: true, modal: NotificationHistory})}>{t('notification_history_button')}</NotificationHistoryButton>

        <WorkArea>
          <Work />
          {this.state.paused ? <OnboardingHint style={{marginTop: '0.1em', position: 'absolute', top: '1.5em'}}><div dangerouslySetInnerHTML={{__html: t('hint_work')}}></div></OnboardingHint> : ''}
        </WorkArea>

        <Scene />
      </div>
    );
  }
}

export default App;
