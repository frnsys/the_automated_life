import {connect} from 'react-redux';
import React from 'react';
import education from 'data/education.json'

const School = (props) => {
  return <div>
    <h1>Education {education[props.player.education].name}</h1>
    {props.player.education < education.length - 1 && props.player.job.name != 'Student' ?
      <h1 onClick={props.enrollSchool}>GO TO SCHOOL</h1> : ''}
  </div>;
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
