import config from 'config';
import {connect} from 'react-redux';
import React, { Component } from 'react';
import { Button } from './styles'
import styled from 'styled-components';
import education from 'data/education.json';
import programs from 'data/programs.json';
import jobs from 'data/jobs.json';
import graph from './3d/graph';

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

class School extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedProgram: 0
    };
  }

  enrollSchool(withLoan, totalCost) {
    graph.lock();
    let nextJob = this.props.jobs[programs[this.state.selectedProgram].job];
    this.props.enrollSchool(this.state.selectedProgram, nextJob);
		if (withLoan) {
			this.props.getLoan(totalCost);
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
          <ul style={{maxHeight: '100px', overflowY: 'scroll'}}>
            {programs.map((p, i) => {
              return <li key={p.name} onClick={() => this.setState({selectedProgram: i})}>
                <ProgramInfoStyle selected={i == this.state.selectedProgram}>
                  <h5>{p.name} <span style={{color: '#777', fontWeight: 'normal'}}>{p.years} years</span></h5>
                  <span style={{fontSize: '0.8em', color: '#777'}}>Leads to a job as <span style={{color: '#222'}}>{jobs[p.job].name}</span></span>
                </ProgramInfoStyle>
              </li>;
            })}
          </ul>
        </div>;
      }

			let totalCost = (nextLevel.years * 12 * config.monthlyExpenses) + nextLevel.cost;
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
