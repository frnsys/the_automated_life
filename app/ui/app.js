import React, {Component} from 'react';
import {connect} from 'react-redux';
import robots from '../robots';
import logic from '../logic';
import Scene from './scene';
import Notifications from './notifications';
import { GlobalStyle, HUD } from './styles'

const NewRobot = (props) => {
  console.log(props.skills);
  return <div>
    This robot is capable of the following skills with {(props.productivity * 100).toFixed(2)}% efficiency:
    <ul>
      {props.skills.map(s => <li key={s.name}>{s.name}</li>)}
    </ul>
  </div>;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.notifications = React.createRef();
    this.createRobot = this.createRobot.bind(this);
  }

  notify(title, msg) {
    this.notifications.current(title, msg);
  }

  createRobot() {
    let action = this.props.createRobot();
    let robot = action.payload;
    let title = `Robot model ${robot.name} released.`;
    let skills = robot.skills.map(id => this.props.skills[id]);
    console.log(action.payload.skills);
    this.notify(title, <NewRobot {...robot} skills={skills} />);
  }

  render() {
    return (
      <div>
        <GlobalStyle />
        <Notifications children={add => (this.notifications.current = add)} />

        <HUD>
          <div>Cash: ${this.props.player.cash.toFixed(2)}</div>
          <div>Job: {this.props.player.job.name}</div>
          <div>Wage: ${this.props.player.job.wage.toFixed(2)}</div>
        </HUD>

        <h1>Robots</h1>
        <div onClick={this.createRobot}>Create Robot</div>
        <ul>
          {this.props.robots.map(r => {
            return <li key={r.id}>Robot {r.id} {(r.productivity*100).toFixed(1)}%</li>;
          })}
        </ul>

        <h1>Jobs</h1>
        <ul>
          {Object.keys(this.props.jobs).map(id => {
            let job = this.props.jobs[id];
            return <li key={id}>{job.name} : ${job.wage.toFixed(2)} <div onClick={() => this.props.setJob(job)}>SET JOB</div></li>;
          })}
        </ul>
        <Scene />
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
  },

  setJob: (job) => {
    return {
      type: 'player:hire',
      payload: job
    };
  }
};

export default connect(mapStateToProps, mapActionsToProps)(App);