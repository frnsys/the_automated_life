import t from 'i18n';
import React, { Component } from 'react';

class About extends Component {
  render() {
    return <div>
      <div className='about-content' dangerouslySetInnerHTML={{__html: t('about_content')}}></div>
      <div className='button' onClick={() => this.props.closeModal()}>{t('resume_button')}</div>
    </div>
  }
}

export default About;
