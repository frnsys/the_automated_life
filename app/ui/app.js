import React, {Component} from 'react';
import {connect} from 'react-redux';
import robots from '../robots';
import logic from '../logic';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Robots</h1>
        <div onClick={this.props.createRobot}>Create Robot</div>
        <ul>
          {this.props.robots.map(r => {
            return <li key={r.id}>Robot {r.id} {(r.productivity*100).toFixed(1)}%</li>;
          })}
        </ul>

        <h1>Jobs</h1>
        <ul>
          {Object.keys(this.props.jobs).map(id => {
            let job = this.props.jobs[id];
            return <li key={id}>{job.name} : ${job.wage.toFixed(2)}</li>;
          })}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
    return state;
};

const mapActionsToProps = {
  createRobot: () => {
    let robot = robots.create();
    logic.releaseRobot(robot);
    return {
      type: 'robot:create',
      payload: robot
    };
  }
};

export default connect(mapStateToProps, mapActionsToProps)(App);
