import {connect} from 'react-redux';
import React, {Component} from 'react';
import education from '../../data/education.json'

class School extends Component {
  render() {
    return <div>
      <h1>Education {education[this.props.player.education].name}</h1>
      {this.props.player.education < education.length - 1 && this.props.player.job.name != 'Student' ?
        <h1 onClick={this.props.enrollSchool}>GO TO SCHOOL</h1> : ''}
    </div>;
  }
}

const mapStateToProps = (state, props) => {
    return state;
};

const mapActionsToProps = {
  enrollSchool: () => {
    return {
      type: 'player:enroll'
    };
  }
}

export default connect(mapStateToProps, mapActionsToProps)(School);
