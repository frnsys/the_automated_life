import t from 'i18n';
import log from 'log';
import React, { Component } from 'react';
import loop from '../loop';
import graph from './3d/graph';
import config from 'config';
import store from 'store';
import jobs from 'data/jobs.json'
import {availableLanguages, lang} from '../i18n';
// import Reference from './reference';
import Tutorial from './tutorial';

class StartMenu extends Component {
  static requireChoice = true;

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
    log('started', {job: this.state.selectedJob});
    this.props.closeModal();

    // Hack to advance the tutorial throughout the game
    setTimeout(() => {
      this.props.togglePause();
      let tutorial = new Tutorial(this.props.togglePause);
    }, 250);
    document.body.classList.remove('pregame');
  }

  render() {
    return <div className='start-menu'>
      <div className="languages">
        {availableLanguages.map((l) => {
          return <a key={l} href={`/?lang=${l}`} className={l == lang ? 'selected-language': ''}>{l.toUpperCase()}</a>;
        })}
      </div>
      <h2>{t('start_welcome')}</h2>
      <p>{t('start_intro')}</p>
      <h3>{t('select_starting_job')}:</h3>
      <ul>
        {config.startingJobs.map((id) => {
          return <li
            key={id}
            onClick={() => this.setState({selectedJob: id})}
            className={this.state.selectedJob == id ? 'selected' : ''}>{t(jobs[id].name)}</li>;
        })}
      </ul>
      <div className='button' onClick={this.startGame.bind(this)}>{t('select_starting_job_button')}</div>
    </div>
  }
}

export default StartMenu;
