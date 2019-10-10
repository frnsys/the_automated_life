import t from 'i18n';
import log from 'log';
import config from 'config';
import education from 'data/education.json';
import programs from 'data/programs.json';
import jobs from 'data/jobs.json';
import graph from './3d/graph';
import store from 'store';
import {connect} from 'react-redux';
import React, {Component} from 'react';

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}


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
      <h3 className='industry-name' onClick={() => this.setState({open: !this.state.open})}><span className='industry-arrow'>{this.state.open ? '▼' : '▶'}</span> {ind}</h3>
      <ul style={{display: this.state.open ? 'block' : 'none'}}>
        {programs[ind].map((p, i) => {
          return <li key={i} onClick={() => this.props.onClick(p)}>
            <div className='program' style={{background: this.props.selected == p ? '#7efc82' : 'none'}}>
              <h5>{toTitleCase(jobs[p.job.toString()].name)} <span className='muted'>{t('years_duration', {years: p.years})}</span></h5>
              <span className='program-name'>{t('study_program', {name: p.name})}</span>
            </div>
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

    let subsidyPercent = 0;
    if (config.schoolSubsidies) {
      subsidyPercent = config.subsidyPercent;
    }

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
        programsInfo = <div className='programs'>
          <h3>{t('select_program')}:</h3>
          <ul>
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
      let totalCostWithSubsidy = 0;
      let needsLoan = false;
      if (!secondary || this.state.selectedProgram) {
        let years = secondary ? this.state.selectedProgram.years : nextLevel.years;
        totalCost = (years * 12 * config.monthlyExpenses) + (nextLevel.cost * years);
        totalCostWithSubsidy = (1 - subsidyPercent) * totalCost;
        needsLoan = totalCostWithSubsidy > 0 && totalCostWithSubsidy > this.props.player.cash;
        if (needsLoan) {
          loanInfo = <div>
            <div className='loan-warning'>{t('loan_warning')}:</div>
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
      let totalCostWithSubsidyWageMonths = this.props.player.job !== 'Unemployed' ? ` (${t('cost_in_wages', {
        months: Math.ceil(totalCostWithSubsidy/(this.props.player.job.wageAfterTaxes/12))
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
          {this.props.player.education >= 2 ? <p>{t('school_postsecondary_note')}</p> : ''}

          {subsidyPercent ? <div className="item-box item-box-subsidy">
              <div>{t('subsidy_note', {subsidy: (config.subsidyPercent * 100).toFixed(0)})}</div>
              <div><b>{t('after_subsidy')}:</b> ${totalCostWithSubsidy.toLocaleString()}{totalCostWithSubsidyWageMonths}</div></div> : ''}

					{loanInfo}
          {(!secondary || this.state.selectedProgram) ?
            <div className='button' onClick={() => this.enrollSchool(needsLoan, totalCostWithSubsidy)}>{t('enroll_button')}</div> : ''}
				</div>
			);
		}

    return <div className='school'>
      <h3>{t('education_title')}</h3>
			{body}
    </div>
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
