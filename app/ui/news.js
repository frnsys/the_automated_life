import t from 'i18n';
import config from 'config';
import React, { Component } from 'react';

class News extends Component {
  static requireChoice = false;

  constructor(props) {
    super(props);
    this.state = {
      accepted: false
    };
  }

  render() {
    return <div className='news'>
      <h1>{t('news_title')}</h1>
      <p>{this.props.data.news}</p>
      {this.props.data.extra ? <b className='news-extra' style={{color: this.props.data.extra.color}}>{this.props.data.extra.text}</b> : ''}
      <div className='news-opt-out'>
        <input id='silence' type='checkbox' checked={this.state.accepted} onChange={(ev) => this.setState({accepted: !this.state.accepted})} /><label htmlFor='silence'>{t('news_silence_note')}</label>
      </div>
      <div className='button' onClick={() => this.props.data.close(this.state.accepted)}>{t('resume_button')}</div>
    </div>
  }
}

export default News;
