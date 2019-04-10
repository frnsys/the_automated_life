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
  cursor: pointer;
  margin: 1em 0 0 0;
  color: red;
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
    return <div>
      <IndustryStyle onClick={() => this.setState({open: !this.state.open})}>{ind}</IndustryStyle>
      <ul style={{display: this.state.open ? 'block' : 'none'}}>
        {programs[ind].map((p, i) => {
          return <li key={i} onClick={() => this.props.onClick(p)}>
            <ProgramInfoStyle selected={this.props.selected == p}>
              <h5>{toTitleCase(jobs[p.job.toString()].name)} <span style={{color: '#777', fontWeight: 'normal'}}>{p.years} years</span></h5>
              <span style={{fontSize: '0.8em', color: '#777'}}>Study <span style={{color: '#222'}}>{p.name}</span></span>
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
      selectedProgram: programs[ind][0]
    };
  }

  enrollSchool(withLoan, totalCost) {
    graph.lock();

    let {time} = store.getState();
    let nextJob = this.props.jobs[this.state.selectedProgram.job];
    let nextLevel = education[this.props.player.education+1];
    log('enrolled', {nextEducation: nextLevel, program: this.state.selectedProgram, time: time});

    this.props.enrollSchool(this.state.selectedProgram, nextJob);
		if (withLoan) {
			this.props.getLoan(totalCost);
      log('loan', {amount: totalCost, time: time});
		}
    this.props.closeModal();
  }

  render() {
		let alreadyEnrolled = this.props.player.job.name == 'Student';
		let fullyEducated = !(this.props.player.education < education.length - 1);
		let body = '';
		if (alreadyEnrolled) {
			body = <h2>You are already enrolled.</h2>;
		} else if (fullyEducated) {
			body = <h2>You are fully educated.</h2>;
		} else {
			let nextLevel = education[this.props.player.education+1];
			let programsInfo = '';
      if (nextLevel.name == 'Secondary Degree') {
        programsInfo = <div style={{margin: '1em 0 0 0'}}>
          <h3 style={{margin: '0 0 0.5em 0'}}>Select a program to enroll in:</h3>
          <ul style={{maxHeight: '150px', overflowY: 'scroll'}}>
            {Object.keys(programs).map((ind, i) => {
              return <IndustryPrograms key={i}
                industry={ind}
                open={i == 0} selected={this.state.selectedProgram}
                onClick={(p) => this.setState({selectedProgram: p})} />;
            })}
          </ul>
        </div>;
      }

      let years = nextLevel.name == 'Secondary Degree' ? this.state.selectedProgram.years : nextLevel.years;
			let totalCost = (years * 12 * config.monthlyExpenses) + (nextLevel.cost * years);
			let needsLoan = totalCost > this.props.player.cash;
			let loanInfo = '';
			if (needsLoan) {
				loanInfo = <div>
					<h3>You can't afford school. If you enroll, you will receive a loan to cover all costs with the following terms:</h3>
          <div className='item-box'>
            <div><b>Interest rate:</b> {(config.loanTerms.interestRate*100).toFixed(1)}% fixed, {config.loanTerms.years}-year</div>
          </div>
				</div>;
			}

			body = (
				<div>
          <div className='item-box'>
            <div><b>Next level:</b> {nextLevel.name}</div>
            <div><b>Cost, with living expenses:</b> ${totalCost.toLocaleString()}</div>
            {programsInfo}
          </div>
					{loanInfo}
					<Button onClick={() => this.enrollSchool(needsLoan, totalCost)}>Enroll</Button>
				</div>
			);
		}

    return <div>
      <h3>Education</h3>
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
