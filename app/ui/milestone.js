import t from 'i18n';
import config from 'config';
import React, { Component } from 'react';

class Milestone extends Component {
  static requireChoice = false;

  render() {
    return <div className='milestone'>
      <img src={`/static/gifs/${this.props.data.icon}.gif`} />
      <h1>{this.props.data.title}</h1>
      <p>{this.props.data.text}</p>
      <div className='button' onClick={() => this.props.data.close()}>{t('resume_button')}</div>
    </div>
  }
}

export default Milestone;
