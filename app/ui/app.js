import t from 'i18n';
import config from 'config';
import HUD from './hud';
import Work from './work';
import Scene from './scene';
import Modal from 'react-modal';
import Skills from './skills';
import School from './school';
import StartMenu from './startMenu';
import ConsentForm from './consent';
import ReactTooltip from 'react-tooltip'
import {GameOver, GameOverSurvey} from './gameOver';
import {Notifications, history} from './notifs';
import React, { Component } from 'react';
import Tutorial from './tutorial';

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

const NotificationHistory = () => {
  return <div className='notification-history'>
    <h3>{t('notification_history_title')}</h3>
    {history.map((h, i) => {
      return <div className='notification-message' key={i} style={{width: '100%', fontSize: '0.8em'}}>
        <div className="notification-content" style={h.style}>
          <div>
            <div className="notification-title">{h.title}</div>
            {h.msg ? <div className="notification-body">{h.msg}</div> : ''}
          </div>
        </div>
      </div>
    })}
  </div>;
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      started: false,
      modal: ConsentForm, //StartMenu,
      modalIsOpen: true,
      paused: true,
      help: false,
      speedup: window.speedup,
      gameOver: null
    };

    this.openModal = () => this.setState({modalIsOpen: true});
    this.closeModal = (nextModal) => {
      if (typeof nextModal === 'function') {
        this.setState({modal: nextModal});
      } else {
        this.setState({modalIsOpen: false});
      }
    };

    // Hacky way to call game over
    window.gameOver = (gameOver) => {
      if (config.testGameOver) {
        IDENTIFIER = '2786654d-9b88-4b8f-9797-39116a744baa';
      }
      fetch(`/summary/${IDENTIFIER}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
        .then((data) => {
          gameOver.summary = data.summary;
          gameOver.aggregate = data.aggregate;
          this.setState({gameOver});
        })
        .catch(err => { console.log(err) });
    };
  }

  togglePause() {
    let paused = this.state.paused;
    window.paused = !paused;
    window.started = true;
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
          <this.state.modal closeModal={this.closeModal} togglePause={this.togglePause.bind(this)} />
        </Modal>

        {this.state.paused || this.state.help ?
            <div className='help-hint graph-help-hint'>
              <div dangerouslySetInnerHTML={{__html: t('hint_job_graph', {
                applicationMonths: config.applicationMinMonths
              })}}></div>
            </div> : ''}

        <div className='hud-area'>
          <div className='time-controls'>
            <div className='time-button' onClick={() => this.setState({modal: Tutorial, modalIsOpen: true})}>?</div>
            <div className='time-button' onClick={this.togglePause.bind(this)}>
              {this.state.paused ? t('resume_button') : t('pause_button')}
            </div>
            <div className='time-button' onClick={this.toggleSpeed.bind(this)}>🕛 {window.speedup}x</div>
          </div>
          <HUD>
            <div className='button' onClick={() => this.setState({modalIsOpen: true, modal: Skills})}>{t('skills_button')}</div>
            <div className='button' onClick={() => this.setState({modalIsOpen: true, modal: School})}>{t('school_button')}</div>
          </HUD>
          {this.state.paused || this.state.help ? <div className='help-hint hud-help-hint'>
            <div dangerouslySetInnerHTML={{__html: t('hint_hud')}}></div>
          </div>: ''}
        </div>

        <div className='notification-history-button' onClick={() => this.setState({modalIsOpen: true, modal: NotificationHistory})}>
          {t('notification_history_button')}
        </div>

        <div className='work-area'>
          <Work />
          {this.state.paused || this.state.help ? <div className='help-hint work-help-hint'>
            <div dangerouslySetInnerHTML={{__html: t('hint_work')}}></div>
          </div> : ''}
        </div>

        <Scene />
      </div>
    );
  }
}

export default App;
