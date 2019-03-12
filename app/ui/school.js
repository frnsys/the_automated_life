import config from 'config';
import {connect} from 'react-redux';
import React, { Component } from 'react';
import { Button } from './styles'
import education from 'data/education.json';
import graph from './3d/graph';

class School extends Component {
  enrollSchool(withLoan, totalCost) {
    graph.lock();
    this.props.enrollSchool();
		if (withLoan) {
			this.props.getLoan(totalCost);
		}
    this.props.closeModal();
  }

  render() {
		let alreadyEnrolled = this.props.job.name == 'Student';
		let fullyEducated = !(this.props.education < education.length - 1);
		let body = '';
		if (alreadyEnrolled) {
			body = <h2>You are already enrolled.</h2>;
		} else if (fullyEducated) {
			body = <h2>You are fully educated.</h2>;
		} else {
			let nextLevel = education[this.props.education+1];
			let totalCost = (nextLevel.years * 12 * config.monthlyExpenses) + nextLevel.cost;
			let needsLoan = totalCost > this.props.cash;
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
  return state.player;
};

const mapActionsToProps = {
  enrollSchool: () => {
    return {
      type: 'player:enroll'
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
