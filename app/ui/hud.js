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
  max-width: 200px;
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
  max-width: 200px;
  border: 2px solid black;
  background: #fff;
`;

const Stat = (props) => {
  return <div style={{margin: '0.25em 0', flex: 1}}><span data-tip={props.name} style={{cursor:'help'}}>{props.children}</span></div>
}

const HUD = (props) => {
  let inSchool = props.player.job.name == 'Student';
  let expensesDesc = `$${props.player.expenses.living.toLocaleString()} living`;
  if (props.player.expenses.debt > 0) {
    expensesDesc += `, $${props.player.expenses.debt.toLocaleString()} debt`;
  }

  return (
    <HUDStyle>
      {props.player.gameOver ? <div className='hud-notice'>Game Over</div> : ''}
      {inSchool ? <div className='hud-notice'>In School</div> : ''}
      <Bar><BarFill style={{width: `${props.time.monthProgress*100}%`}} /></Bar>
      <div style={{display: 'flex'}}>
        <Stat name='Date'>📅 {months[props.time.month-1]} {props.time.year}</Stat>
        <Stat name='Age'>🎂 {props.player.startAge + props.time.years}</Stat>
      </div>
      <div style={{display: 'flex'}}>
        <Stat name='Savings'>🏦 ${numeral(props.player.cash).format('0,0.00a')}</Stat>
        <Stat name='Monthly wage'>💸 ${numeral(props.player.job.wageAfterTaxes/12).format('0,0.0a')}/mo</Stat>
      </div>
      <div data-tip={expensesDesc} style={{fontSize: '0.75em', color: '#888'}}>${(props.player.expenses.living + props.player.expenses.debt).toLocaleString()}/month in expenses</div>
      <Stat name='Level of education'>🎓 {education[props.player.education].name}</Stat>
      {inSchool ? <div style={{fontSize: '0.75em', color: '#888'}}>In school for {props.player.schoolCountdown} more months</div> : ''}
      <Stat name='Current job'>🛠️ {props.player.job.name}</Stat>
      {props.player.application ? <div style={{fontSize: '0.75em', color: '#888'}}>Applied to {props.jobs[props.player.application.id].name}</div> : ''}
      <div style={{marginTop: '1em', display: 'flex'}}>
        {props.children}
      </div>

      <ProgressStyle>
        <h6 style={{margin:'0 0 0.5em 0'}}>Retirement progress</h6>
        <div style={{display: 'flex'}} data-tip={`${config.retirementAge - props.player.startAge - props.time.years} years until retirement`}>
          <div style={{marginRight: '0.5em'}}>🏖️</div> <Bar><BarFill style={{width: `${Math.min(100, ((props.time.years+(props.time.month/12))/(config.retirementAge-props.player.startAge))*100)}%`}} /></Bar>
        </div>
        <div style={{display: 'flex'}} data-tip={`$${numeral(Math.max(0, config.retirementSavingsMin - props.player.cash)).format('0,0.0a')} more needed for retirement`}>
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
