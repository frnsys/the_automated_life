import t from 'i18n';
import log from 'log';
import config from 'config';
import {connect} from 'react-redux';
import React, { Component } from 'react';
import { Button } from './styles'
import styled from 'styled-components';
import education from 'data/education.json';
import programs from 'data/programs.json';
import jobs from 'data/jobs.json';
import graph from './3d/graph';
import store from 'store';

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const SchoolStyle = styled('div')`
  width: 440px;
`;

const LoanWarning = styled('div')`
  color: #ff0000;
  font-size: 1em !important;
`;

const ProgramInfoStyle = styled('div')`
  background: ${props => props.selected ? '#7efc82' : 'none'};
  &:hover {
    background: #aefcb0;
  }
  cursor: pointer;
  margin-bottom: 0.5em;

  h5 {
    margin: 0;
  }
`;

const IndustryStyle = styled('h3')`
  font-size: 1em;
  cursor: pointer;
  margin: 0.25em 0 0 0 !important;
  color: #395be5;
  &:hover {
    text-decoration: underline;
  }
`;

class IndustryPrograms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.open || false
    };
  }

  render() {
    let ind = this.props.industry;
    let arrowStyle = {
      verticalAlign: 'middle',
      fontSize: '0.6em'
    };
    return <div>
      <IndustryStyle onClick={() => this.setState({open: !this.state.open})}><span style={arrowStyle}>{this.state.open ? '▼' : '▶'}</span> {ind}</IndustryStyle>
      <ul style={{display: this.state.open ? 'block' : 'none'}}>
        {programs[ind].map((p, i) => {
          return <li key={i} onClick={() => this.props.onClick(p)}>
            <ProgramInfoStyle selected={this.props.selected == p}>
              <h5>{toTitleCase(jobs[p.job.toString()].name)} <span style={{color: '#777', fontWeight: 'normal'}}>{t('years_duration', {years: p.years})}</span></h5>
              <span style={{fontSize: '0.8em', color: '#777'}}>{t('study_program', {name: p.name})}</span>
            </ProgramInfoStyle>
          </li>;
        })}
      </ul>
    </div>;
  }
}

class School extends Component {
  constructor(props) {
    super(props);
    let ind = Object.keys(programs)[0];
    this.state = {
      selectedProgram: null
    };
  }

  enrollSchool(withLoan, totalCost) {
    graph.lock();

    let {time} = store.getState();
    let nextLevel = education[this.props.player.education+1];

    let nextJob = null;
    if (nextLevel.name == 'Secondary Degree') {
      nextJob = this.props.jobs[this.state.selectedProgram.job];
    }

    let logTime = {year: time.years, month: time.month};
    log('enrolled', {nextEducation: nextLevel, program: this.state.selectedProgram, time: logTime});

    this.props.enrollSchool(this.state.selectedProgram, nextJob);
		if (withLoan) {
			this.props.getLoan(totalCost);
      log('loan', {amount: totalCost, time: logTime});
		}
    this.props.closeModal();
  }

  render() {
		let alreadyEnrolled = this.props.player.job.name == 'Student';
		let fullyEducated = !(this.props.player.education < education.length - 1);
    let secondary = false;
		let body = '';
		if (alreadyEnrolled) {
			body = <h2>{t('already_enrolled')}</h2>;
		} else if (fullyEducated) {
			body = <h2>{t('fully_educated')}</h2>;
		} else {
			let nextLevel = education[this.props.player.education+1];
			let programsInfo = '';
      let secondary = nextLevel.name == 'Secondary Degree';
      if (secondary) {
        programsInfo = <div style={{margin: '1em 0 0 0'}}>
          <h3 style={{margin: 0, padding: '0px 0px 0.2em', borderBottom: '2px solid black'}}>{t('select_program')}:</h3>
          <ul style={{maxHeight: '150px', overflowY: 'scroll'}}>
            {Object.keys(programs).map((ind, i) => {
              return <IndustryPrograms key={i}
                industry={ind}
                open={false} selected={this.state.selectedProgram}
                onClick={(p) => this.setState({selectedProgram: p})} />;
            })}
          </ul>
        </div>;
      }

			let loanInfo = '';
      let totalCost = 0;
      let needsLoan = false;
      if (!secondary || this.state.selectedProgram) {
        let years = secondary ? this.state.selectedProgram.years : nextLevel.years;
        totalCost = (years * 12 * config.monthlyExpenses) + (nextLevel.cost * years);
        needsLoan = totalCost > this.props.player.cash;
        if (needsLoan) {
          loanInfo = <div>
            <LoanWarning>{t('loan_warning')}:</LoanWarning>
            <div className='item-box'>
              <div><b>{t('interest_rate')}:</b> {t('loan_terms', {rate: (config.loanTerms.interestRate*100).toFixed(1), years: config.loanTerms.years})}</div>
            </div>
          </div>;
        }
      }

      let totalCostWageMonths = this.props.player.job !== 'Unemployed' ? ` (${t('cost_in_wages', {months: Math.ceil(totalCost/(this.props.player.job.wageAfterTaxes/12))})})` : '';
			body = (
				<div>
          <div className='item-box'>
            <div><b>{t('next_level')}:</b> {nextLevel.name}</div>
            {(!secondary || this.state.selectedProgram) ?
              <div><b>{t('school_cost')}:</b> ${totalCost.toLocaleString()}{totalCostWageMonths}</div>
                : ''}
            {programsInfo}
          </div>
					{loanInfo}
          {(!secondary || this.state.selectedProgram) ?
            <Button onClick={() => this.enrollSchool(needsLoan, totalCost)}>{t('enroll_button')}</Button> : ''}
				</div>
			);
		}

    return <SchoolStyle>
      <h3>{t('education_title')}</h3>
			{body}
    </SchoolStyle>
  }
}

const mapStateToProps = (state, props) => {
  return {
    player: state.player,
    jobs: state.jobs
  };
};

const mapActionsToProps = {
  enrollSchool: (selectedProgram, nextJob) => {
    return {
      type: 'player:enroll',
      payload: {
        program: selectedProgram,
        nextJob: nextJob
      }
    };
  },
	getLoan: (amount) => {
		return {
      type: 'player:loan',
			payload: amount
		};
	}
}

export default connect(mapStateToProps, mapActionsToProps)(School);
