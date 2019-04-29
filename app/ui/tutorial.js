import t from 'i18n';
import config from 'config';
import React, { Component } from 'react';
import styled from 'styled-components';
import { Button } from './styles'

const TutorialStyle = styled('div')`
  h2 {
    margin: 0;
  }
  h3 {
    margin-bottom: 0;
  }
  ul {
    margin: 0.5em 0 1em;
  }

  .selected {
    background: #39e567;
  }

  li {
    cursor: pointer;
    padding: 0.2em;
  }

  .game-goal {
    background: #fc4040;
    color: #fff;
    padding: 0.3em;
    border: 4px solid #000;
    text-align: center;
  }
`;

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
    return <TutorialStyle>
      <h2>{t('how_to_play_title')}</h2>
      <p className='game-goal'><b>{t('start_goal', {
        age: config.retirementAge,
        savings: config.retirementSavingsMin.toLocaleString()
      })}</b></p>
      <div dangerouslySetInnerHTML={{__html: t('how_to_play')}}></div>
      <Button onClick={this.startGame.bind(this)}>{window.started ? t('resume_button') : t('start_button')}</Button>
    </TutorialStyle>
  }
}

export default Tutorial;
