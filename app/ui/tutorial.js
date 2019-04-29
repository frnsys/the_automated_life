import t from 'i18n';
import config from 'config';
import React, { Component } from 'react';

class Tutorial extends Component {
  startGame() {
    this.props.togglePause();
    this.props.closeModal();
  }

  componentWillMount() {
    if (!window.paused) {
      this.props.togglePause();
    }
  }

  render() {
    return <div className='tutorial'>
      <h2>{t('how_to_play_title')}</h2>
      <p className='game-goal'><b>{t('start_goal', {
        age: config.retirementAge,
        savings: config.retirementSavingsMin.toLocaleString()
      })}</b></p>
      <div dangerouslySetInnerHTML={{__html: t('how_to_play')}}></div>
      <div className='button' onClick={this.startGame.bind(this)}>{window.started ? t('resume_button') : t('start_button')}</div>
    </div>
  }
}

export default Tutorial;
