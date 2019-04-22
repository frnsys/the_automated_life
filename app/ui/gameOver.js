import t from 'i18n';
import log from 'log';
import styled from 'styled-components';
import React, { Component } from 'react';
import {RadioGroup, Radio} from 'react-radio-group'

const GameOverStyle = styled('div')`
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
  .sharing {
    margin-top: 0.25em;
  }
  .sharing a {
    margin-right: 0.5em;
    background: #395be5;
    color: #fff;
    text-decoration: none;
    padding: 0.2em;
    font-size: 0.9em;
  }
  .sharing a:hover {
    background: #2142c6;
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
  label {
    background: #cbd2ef;
    cursor: pointer;
    padding: 0.2em;
    display: block;
  }
  input {
    display: none;
  }
  input:checked+label, label:hover {
    background: #395be5;
    color: #fff;
  }
}
`;

const GameOver = (props) => {
  let result = props.success ? t('game_over_win_share') : t('game_over_lose_share');
  return (
    <GameOverStyle>
      <GameOverAlert>
        <h2>{props.icon} {t('game_over_notice')}</h2>
        {props.text}
        <div className='sharing'>
          <a href={`https://twitter.com/intent/tweet?text=${result}&url=https://${location.host}`}>Share on Twitter</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=https://${location.host}&description=${result}`}>Share on Facebook</a>
        </div>
        <GameOverSurvey />
      </GameOverAlert>
    </GameOverStyle>);
}

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
              <div><Radio value={0} id='age_0' /><label htmlFor='age_0'>0-24</label></div>
              <div><Radio value={1} id='age_1' /><label htmlFor='age_1'>25-44</label></div>
              <div><Radio value={2} id='age_2' /><label htmlFor='age_2'>45-64</label></div>
              <div><Radio value={3} id='age_3' /><label htmlFor='age_3'>65-74</label></div>
              <div><Radio value={4} id='age_4' /><label htmlFor='age_4'>75+</label></div>
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

export {GameOverSurvey, GameOver};
