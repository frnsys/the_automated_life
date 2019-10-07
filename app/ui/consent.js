import t from 'i18n';
import log from 'log';
import StartMenu from './startMenu';
import React, { Component } from 'react';

class ConsentForm extends Component {
  static requireChoice = true;

  constructor(props) {
    super(props);
    this.state = {
      accepted: false
    };
  }

  submit() {
    log('consent', {accepted: this.state.accepted});
    if (this.state.accepted) {
      this.props.closeModal(StartMenu);
    } else {
      alert('This game requires your consent to play.');
    }
  }

  render() {
    return <div className='consent-form'>
      <h2>{t('consent_form_title')}</h2>
      <h3>{t('consent_form_section_1_title')}</h3>
      <p dangerouslySetInnerHTML={{__html: t('consent_form_section_1')}}></p>
      <h3>{t('consent_form_section_2_title')}</h3>
      <p dangerouslySetInnerHTML={{__html: t('consent_form_section_2')}}></p>
      <h3>{t('consent_form_section_3_title')}</h3>
      <p dangerouslySetInnerHTML={{__html: t('consent_form_section_3')}}></p>
      <h3>{t('consent_form_section_4_title')}</h3>
      <p dangerouslySetInnerHTML={{__html: t('consent_form_section_4')}}></p>
      <h3>{t('consent_form_section_5_title')}</h3>
      <p dangerouslySetInnerHTML={{__html: t('consent_form_section_5')}}></p>
      <input id='consent' type='checkbox' checked={this.state.accepted} onChange={(ev) => this.setState({accepted: !this.state.accepted})} /><label htmlFor='consent'>{t('consent_label')}</label>
      <div className='button' onClick={this.submit.bind(this)}>{t('consent_submit_button')}</div>
    </div>
  }
}

export default ConsentForm;
