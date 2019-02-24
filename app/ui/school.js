import {connect} from 'react-redux';
import React from 'react';
import styled from 'styled-components';
import education from 'data/education.json'
import { Button } from './styles'

const SchoolStyle = styled('div')`
  position: fixed;
  z-index: 2;
  right: 1em;
  top: 5em;
  color: #000;
  border: 2px solid black;
  padding: 1em;
  background: #fff;
`;


const School = (props) => {
  let el;
  if (props.player.education < education.length - 1) {
    if (props.player.job.name == 'Student') {
      el = <div>In school for {props.player.schoolCountdown} more months</div>;
    } else {
      el = <Button onClick={props.enrollSchool}>GO TO SCHOOL</Button>;
    }
  }
  return <SchoolStyle>
    <div>Education: {education[props.player.education].name}</div>
    {el}
  </SchoolStyle>;
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
