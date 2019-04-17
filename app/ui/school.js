import t from 'i18n';
import log from 'log';
import config from 'config';
import education from 'data/education.json';
import programs from 'data/programs.json';
import jobs from 'data/jobs.json';
import graph from './3d/graph';
import store from 'store';
import {Button} from './styles'
import {connect} from 'react-redux';
import styled from 'styled-components';
import React, {Component} from 'react';

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


const ProgramsStyle = styled('div')`
  margin: 1em 0 0 0;
  > h3 {
    margin: 0;
    padding: 0px 0px 0.2em;
    border-bottom: 2px solid black;
  }
  > ul {
    max-height: 150px;
    overflow-y: scroll;
  }
`;

const ProgramStyle = styled('div')`
  background: ${props => props.selected ? '#7efc82' : 'none'};
  &:hover {
    background: #aefcb0;
  }
  cursor: pointer;
  margin-bottom: 0.5em;

  h5 {
    margin: 0;
  }
  .muted {
    color: #777;
    font-weight: normal;
  }
  .program-name {
    color: #777;
    font-size: 0.8em;
  }
`;

const IndustryName = styled('h3')`
  font-size: 1em;
  cursor: pointer;
  margin: 0.25em 0 0 0 !important;
  color: #395be5;
  &:hover {
    text-decoration: underline;
  }
`;

const Arrow = styled('span')`
  vertical-align: middle;
  font-size: 0.6em;
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
    return <div>
      <IndustryName onClick={() => this.setState({open: !this.state.open})}><Arrow>{this.state.open ? '▼' : '▶'}</Arrow> {ind}</IndustryName>
      <ul style={{display: this.state.open ? 'block' : 'none'}}>
        {programs[ind].map((p, i) => {
          return <li key={i} onClick={() => this.props.onClick(p)}>
            <ProgramStyle selected={this.props.selected == p}>
              <h5>{toTitleCase(jobs[p.job.toString()].name)} <span className='muted'>{t('years_duration', {years: p.years})}</span></h5>
              <span className='program-name'>{t('study_program', {name: p.name})}</span>
            </ProgramStyle>
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
    let logTime = {year: time.years, month: time.month};
    let nextLevel = education[this.props.player.education+1];

    let nextJob = null;
    if (nextLevel.name == 'Secondary Degree') {
      nextJob = this.props.jobs[this.state.selectedProgram.job];
    }

		if (withLoan) {
			this.props.getLoan(totalCost);
      log('loan', {
        amount: totalCost,
        time: logTime
      });
		}

    this.props.enrollSchool(this.state.selectedProgram, nextJob);
    log('enrolled', {
      nextEducation: nextLevel,
      program: this.state.selectedProgram,
      time: logTime
    });
    this.props.closeModal();
  }

  render() {
    let secondary = false;
		let alreadyEnrolled = this.props.player.job.name == 'Student';
		let fullyEducated = !(this.props.player.education < education.length - 1);

		let body = '';
		if (alreadyEnrolled) {
			body = <h2>{t('already_enrolled')}</h2>;

		} else if (fullyEducated) {
			body = <h2>{t('fully_educated')}</h2>;

		} else {
			let programsInfo = '';
			let nextLevel = education[this.props.player.education+1];
      secondary = nextLevel.name == 'Secondary Degree';

      if (secondary) {
        programsInfo = <ProgramsStyle>
          <h3>{t('select_program')}:</h3>
          <ul>
            {Object.keys(programs).map((ind, i) => {
              return <IndustryPrograms key={i}
                industry={ind}
                open={false} selected={this.state.selectedProgram}
                onClick={(p) => this.setState({selectedProgram: p})} />;
            })}
          </ul>
        </ProgramsStyle>;
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
              <div><b>{t('interest_rate')}:</b> {t('loan_terms', {
                rate: (config.loanTerms.interestRate*100).toFixed(1),
                years: config.loanTerms.years
              })}</div>
            </div>
          </div>;
        }
      }

      let totalCostWageMonths = this.props.player.job !== 'Unemployed' ? ` (${t('cost_in_wages', {
        months: Math.ceil(totalCost/(this.props.player.job.wageAfterTaxes/12))
      })})` : '';
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
