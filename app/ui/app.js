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
import Reference from './reference';
import News from './news';
import About from './about';
import Milestone from './milestone';
import graph from './3d/graph';

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
  constructor(props) {
    super(props);
    this.state = {
      started: false,
      hideNews: false,
      modal: props.gdpr ? ConsentForm : StartMenu,
      modalIsOpen: true,
      modalData: null,
      paused: true,
      manualPaused: false,
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
      if (config.enableLogging) {
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
      }
    };

    // Hacky way to show news modal elsewhere
    window.news = (news, extra) => {
      if (!this.state.hideNews) {
        this.setState({modal: News, modalIsOpen: true, modalData: {
          news: news,
          extra: extra,
          close: (optOut) => {
            this.setState({ hideNews: optOut });
            this.closeModal();
          }
        }});
      }
    }

    // Hack to show milestone modals elsewhere
    window.milestone = (title, text, icon) => {
      this.setState({modal: Milestone, modalIsOpen: true, modalData: {
        title: title,
        text: text,
        icon: icon,
        close: () => {
          this.closeModal();
        }
      }});
    }

    // Hacky way to update speed from elsewhere
    window.updateSpeed = (speedup) => {
      this.setState({ speedup });
    }
    // Hack way to pause from elsewhere
    window.updatePaused = (paused) => {
      window.paused = paused;
      this.setState({ paused });
    }

    document.addEventListener('keydown', (ev) => {
      if (window.started && !this.state.modalIsOpen) {
        if (ev.target.tagName == 'input') return;
        if (ev.key == ' ') {
          this.togglePause();
        }
      }
    });
  }

  togglePause() {
    let paused = this.state.paused;
    window.paused = !paused;
    window.started = true;
    let manualPaused = !paused;
    this.setState({ paused: !paused, started: true, manualPaused });
  }

  pause() {
    window.paused = true;
    this.setState({ paused: true });
  }

  unpause() {
    window.paused = false;
    this.setState({ paused: false });
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

  zoomToAll() {
    graph.zoomToAll();
  }

  zoomToCurrent() {
    graph.zoomToCurrent();
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
          onAfterOpen={() => this.pause()}
          onAfterClose={() => {if (!this.state.manualPaused) this.unpause()}}
          onRequestClose={this.closeModal}
          style={customStyles}
          shouldCloseOnEsc={!this.state.modal.requireChoice}
          shouldCloseOnOverlayClick={!this.state.modal.requireChoice}
          contentLabel='Game Alert'>
          <this.state.modal data={this.state.modalData} closeModal={this.closeModal} togglePause={this.togglePause.bind(this)} />
        </Modal>

        {this.state.paused || this.state.help ?
            <div className='help-hint graph-help-hint'>
              <div dangerouslySetInnerHTML={{__html: t('hint_job_graph', {
                applicationMonths: config.applicationMinMonths
              })}}></div>
            </div> : ''}

        <div className='hud-area'>
          <div className='time-controls'>
            <div className='time-button' onClick={() => this.setState({modal: Reference, modalIsOpen: true})}>?</div>
            <div className='time-button' onClick={this.togglePause.bind(this)}>
              {this.state.paused ? t('resume_button') : t('pause_button')}
            </div>
            <div className='time-button' onClick={this.toggleSpeed.bind(this)}>🕛 {window.speedup}x</div>
            <div className='time-button zoom-button' onClick={this.zoomToAll.bind(this)}><img src="/static/resize.svg" /></div>
            <div className='time-button zoom-button' onClick={this.zoomToCurrent.bind(this)}><img src="/static/pin.svg" /></div>
          </div>
          <HUD>
            <div className='button' onClick={() => this.setState({modalIsOpen: true, modal: School})}>{t('school_button')}</div>
            <div className='button' onClick={() => this.setState({modalIsOpen: true, modal: Skills})}>{t('skills_button')}</div>
          </HUD>
          {this.state.paused || this.state.help ? <div className='help-hint hud-help-hint'>
            <div dangerouslySetInnerHTML={{__html: t('hint_hud')}}></div>
          </div>: ''}
        </div>

        <div className='mini-menu'>
          <div onClick={() => this.setState({modalIsOpen: true, modal: NotificationHistory})}>
            {t('notification_history_button')}
          </div>
          <div onClick={() => this.setState({modalIsOpen: true, modal: About})}>
            {t('about')}
          </div>
        </div>

        <div className='work-area'>
          <Work />
          {this.state.paused || this.state.help ? <div className='help-hint work-help-hint'>
            <div dangerouslySetInnerHTML={{__html: t('hint_work')}}></div>
          </div> : ''}
        </div>

        <Scene jobs={this.props.jobs} graph={graph} />
      </div>
    );
  }
}

export default App;
