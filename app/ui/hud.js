import t from 'i18n';
import React from 'react';
import {connect} from 'react-redux';
import skills from 'data/skills.json'
import education from 'data/education.json'
import numeral from 'numeral';
import config from 'config';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const Stat = (props) => {
  return <div className='stat'><span data-tip={props.name}>{props.children}</span></div>
}

function earlyRetirement(age) {
  let m = (config.retirementSavingsMin - config.minRetirementAgeSavingsMin)/(config.retirementAge - config.minRetirementAge);
  return config.minRetirementAgeSavingsMin + (age - config.minRetirementAge) * m;
}

function canRetire(age, savings) {
  if (age < config.minRetirementAge) return false;
  let amount = earlyRetirement(age);
  return savings >= amount;
}

const HUD = (props) => {
  let inSchool = props.player.job.name == 'Student';
  let unemployed = props.player.job.name == 'Unemployed';
  let expensesDesc = t('living_expenses', {amount: props.player.expenses.living.toLocaleString()});
  if (props.player.expenses.debt > 0) {
    expensesDesc += `, ${t('debt_expenses', {amount: props.player.expenses.debt.toLocaleString()})}`;
  }
  let age = props.player.startAge + props.time.years;

  return (
    <div className='hud'>
      {props.player.gameOver ? <div className='hud-notice'>{t('game_over_notice')}</div> : ''}
      {inSchool ? <div className='hud-notice'>{t('in_school_notice')}</div> : ''}
      {unemployed ? <div className='hud-notice'>{t('unemployed_notice')}</div> : ''}
      <div className='bar'><div className='bar-fill' style={{width: `${props.time.monthProgress*100}%`}} /></div>
      <div className='stat-group'>
        <Stat name={t('stat_date')}>
          📅 {months[props.time.month-1]} {props.time.year}
        </Stat>
        <Stat name={t('stat_age')}>
          🎂 {age}
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
        🎓 {t(education[props.player.education].name)}
      </Stat>
      {inSchool ?
          <div className='stat-hint'>{t('school_remaining', {months: props.player.schoolCountdown})}</div> : ''}
      <Stat name={t('stat_current_job')}>
        🛠️ {t(props.player.job.name == 'Unemployed' ? 'unemployed_notice' : props.player.job.name)}
      </Stat>
      {props.player.application ?
          <div className='stat-hint'>{t('application_notice', {name: t(props.jobs[props.player.application.id].name)})}</div> : ''}
      <div className='hud-children'>
        {props.children}
      </div>

      <div className='hud-progress'>
        <h6>{t('retirement_progress')} <div
            style={{visibility: age >= config.minRetirementAge ? 'visible': 'hidden'}}
            className={`button ${canRetire(age, props.player.cash) ? '' : 'disabled'}`}
            onClick={() => props.retireEarly()}
            data-tip={t('retirement_early_tip', {amount: earlyRetirement(age).toLocaleString()})}>{t('retirement_early')}</div></h6>
        <div className='stat-group' data-tip={t('retirement_remaining', {years: config.retirementAge - props.player.startAge - props.time.years})}>
          <div className='stat-icon'>🏖️</div>
          <div className='bar'><div className='bar-fill' style={{width: `${Math.min(1, (props.time.years+(props.time.month/12))/(config.retirementAge-props.player.startAge))*100}%`}} /></div>
        </div>
        <div className='stat-group' data-tip={t('retirement_savings_remaining', {amount: numeral(Math.max(0, config.retirementSavingsMin - props.player.cash)).format('0,0.0a')})}>
          <div className='stat-icon'>💰</div>
          <div className='bar' style={{border: props.player.cash < 0 ? '1px solid red' : ''}}><div className='bar-fill' style={{width: `${Math.min(1, props.player.cash/config.retirementSavingsMin)*100}%`}} />{props.player.cash < 0 ? <div className='stat-debt'>{numeral(-props.player.cash).format('$0,0.0a')} in debt</div> : ''}</div>
        </div>
      </div>
    </div>
  );
}


const mapStateToProps = (state, props) => {
  return {
    time: state.time,
    player: state.player,
    jobs: state.jobs
  };
};

const mapActionsToProps = {
	retireEarly: () => {
		return {
      type: 'player:retireEarly'
		};
	}
}

export default connect(mapStateToProps, mapActionsToProps)(HUD);
