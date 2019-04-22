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
  max-width: 240px;
  border: 2px solid black;
  background: #fff;

  .stat {
    margin: 0.25em 0;
    flex: 1;
    span {
      cursor: help;
    }
  }

  .stat-group {
    display: flex;
  }

  .stat-hint {
    font-size: 0.75em;
    color: #888;
  }

  .hud-children {
    margin-top: 1em;
    display: flex;
  }
`;

const ProgressStyle = styled('div')`
  position: fixed;
  z-index: 3;
  left: 1em;
  bottom: 1em;
  color: #000;
  padding: 0.5em;
  max-width: 240px;
  border: 2px solid black;
  background: #fff;

  h6 {
    margin: 0 0 0.5em 0;
  }

  .stat-icon {
    margin-right: 0.5em;
  }
`;

const Stat = (props) => {
  return <div className='stat'><span data-tip={props.name}>{props.children}</span></div>
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
      <Bar><BarFill width={props.time.monthProgress} /></Bar>
      <div className='stat-group'>
        <Stat name={t('stat_date')}>
          📅 {months[props.time.month-1]} {props.time.year}
        </Stat>
        <Stat name={t('stat_age')}>
          🎂 {props.player.startAge + props.time.years}
        </Stat>
      </div>
      <div className='stat-group'>
        <Stat name={t('stat_savings')}>
          🏦 ${numeral(props.player.cash).format('0,0.00a')}
        </Stat>
        <Stat name={t('stat_wage')}>
          💸 ${numeral(props.player.job.wageAfterTaxes/12).format('0,0.0a')}/{t('month_unit')}
        </Stat>
      </div>
      <div data-tip={expensesDesc} className='stat-hint'>
        {t('monthly_expenses', {amount: (props.player.expenses.living + props.player.expenses.debt).toLocaleString()})}
      </div>
      <Stat name={t('stat_education')}>
        🎓 {education[props.player.education].name}
      </Stat>
      {inSchool ?
          <div className='stat-hint'>{t('school_remaining', {months: props.player.schoolCountdown})}</div> : ''}
      <Stat name={t('stat_current_job')}>
        🛠️ {props.player.job.name}
      </Stat>
      {props.player.application ?
          <div className='stat-hint'>{t('application_notice', {name: props.jobs[props.player.application.id].name})}</div> : ''}
      <div className='hud-children'>
        {props.children}
      </div>

      <ProgressStyle>
        <h6>{t('retirement_progress')}</h6>
        <div className='stat-group' data-tip={t('retirement_remaining', {years: config.retirementAge - props.player.startAge - props.time.years})}>
          <div className='stat-icon'>🏖️</div>
          <Bar><BarFill width={Math.min(1, (props.time.years+(props.time.month/12))/(config.retirementAge-props.player.startAge))} /></Bar>
        </div>
        <div className='stat-group' data-tip={t('retirement_savings_remaining', {amount: numeral(Math.max(0, config.retirementSavingsMin - props.player.cash)).format('0,0.0a')})}>
          <div className='stat-icon'>💰</div>
          <Bar><BarFill width={Math.min(1, props.player.cash/config.retirementSavingsMin)} /></Bar>
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
