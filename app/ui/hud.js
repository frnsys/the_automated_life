import t from 'i18n';
import React from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';
import { Bar, BarFill } from './styles'
import skills from 'data/skills.json'
import education from 'data/education.json'
import numeral from 'numeral';
import config from 'config';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const HUDStyle = styled('div')`
  color: #000;
  padding: 0.5em;
  max-width: 220px;
  border: 2px solid black;
  background: #fff;
`;

const ProgressStyle = styled('div')`
  position: fixed;
  z-index: 3;
  left: 1em;
  bottom: 1em;
  color: #000;
  padding: 0.5em;
  max-width: 220px;
  border: 2px solid black;
  background: #fff;
`;

const Stat = (props) => {
  return <div style={{margin: '0.25em 0', flex: 1}}><span data-tip={props.name} style={{cursor:'help'}}>{props.children}</span></div>
}

const HUD = (props) => {
  let inSchool = props.player.job.name == 'Student';
  let unemployed = props.player.job.name == 'Unemployed';
  let expensesDesc = t('living_expenses', {amount: props.player.expenses.living.toLocaleString()});
  if (props.player.expenses.debt > 0) {
    expensesDesc += `, ${t('debt_expenses', {amount: props.player.expenses.debt.toLocaleString()})}`;
  }

  return (
    <HUDStyle>
      {props.player.gameOver ? <div className='hud-notice'>{t('game_over_notice')}</div> : ''}
      {inSchool ? <div className='hud-notice'>{t('in_school_notice')}</div> : ''}
      {unemployed ? <div className='hud-notice'>{t('unemployed_notice')}</div> : ''}
      <Bar><BarFill style={{width: `${props.time.monthProgress*100}%`}} /></Bar>
      <div style={{display: 'flex'}}>
        <Stat name={t('stat_date')}>📅 {months[props.time.month-1]} {props.time.year}</Stat>
        <Stat name={t('stat_age')}>🎂 {props.player.startAge + props.time.years}</Stat>
      </div>
      <div style={{display: 'flex'}}>
        <Stat name={t('stat_savings')}>🏦 ${numeral(props.player.cash).format('0,0.00a')}</Stat>
        <Stat name={t('stat_wage')}>💸 ${numeral(props.player.job.wageAfterTaxes/12).format('0,0.0a')}/{t('month_unit')}</Stat>
      </div>
      <div data-tip={expensesDesc} style={{fontSize: '0.75em', color: '#888'}}>{t('monthly_expenses', {amount: (props.player.expenses.living + props.player.expenses.debt).toLocaleString()})}</div>
      <Stat name={t('stat_education')}>🎓 {education[props.player.education].name}</Stat>
      {inSchool ? <div style={{fontSize: '0.75em', color: '#888'}}>{t('school_remaining', {months: props.player.schoolCountdown})}</div> : ''}
      <Stat name={t('stat_current_job')}>🛠️ {props.player.job.name}</Stat>
      {props.player.application ? <div style={{fontSize: '0.75em', color: '#888'}}>{t('application_notice', {name: props.jobs[props.player.application.id].name})}</div> : ''}
      <div style={{marginTop: '1em', display: 'flex'}}>
        {props.children}
      </div>

      <ProgressStyle>
        <h6 style={{margin:'0 0 0.5em 0'}}>{t('retirement_progress')}</h6>
        <div style={{display: 'flex'}} data-tip={t('retirement_remaining', {years: config.retirementAge - props.player.startAge - props.time.years})}>
          <div style={{marginRight: '0.5em'}}>🏖️</div> <Bar><BarFill style={{width: `${Math.min(100, ((props.time.years+(props.time.month/12))/(config.retirementAge-props.player.startAge))*100)}%`}} /></Bar>
        </div>
        <div style={{display: 'flex'}} data-tip={t('retirement_savings_remaining', {amount: numeral(Math.max(0, config.retirementSavingsMin - props.player.cash)).format('0,0.0a')})}>
          <div style={{marginRight: '0.5em'}}>💰</div> <Bar><BarFill style={{width: `${(Math.min(100, props.player.cash/config.retirementSavingsMin)*100)}%`}} /></Bar>
        </div>
      </ProgressStyle>
    </HUDStyle>
  );
}


const mapStateToProps = (state, props) => {
  return {
    time: state.time,
    player: state.player,
    jobs: state.jobs
  };
};

export default connect(mapStateToProps)(HUD);
