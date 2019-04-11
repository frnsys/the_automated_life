import React from 'react';
import {connect} from 'react-redux';
import { Bar, BarFill } from './styles'
import config from 'config';
import styled from 'styled-components';

const PerformanceLabel = styled('div')`
  position: absolute;
  left: 0.5em;
  bottom: 0;
  color: #000;
  font-size: 0.9em;
`;

const WorkBar = styled('div')`
  border: 2px solid black;
  user-select: none;
  position: relative;
`;

const WorkButton = styled('div')`
  color: #fff;
  display: inline-block;
  border: 1px solid #c41010;
  background: #ea432a;
  padding: 0.25em 0.5em;
  cursor: pointer;
  user-select: none;
  &:hover {
    background: #fe0f0f;
  }
`;

const Work = (props) => {
  // Don't show work minigame if not employed
  let job = props.player.job.name;
  if (job == 'Unemployed' || job == 'Student') {
    return <div></div>;
  }
  let p = props.player.performance;
  let performance = 'Decent';
  let performanceColor = '#000';
  if (p <= 10) {
    performance = 'Terrible';
    performanceColor = '#f71d09';
  } else if (p <= 30) {
    performance = 'Bad';
    performanceColor = '#ef5028';
  } else if (p <= 60) {
    performance = 'Mediocre';
    performanceColor = '#efb428';
  } else if (p <= 80) {
    performance = 'Good';
    performanceColor = '#11c441';
  } else if (p <= 100) {
    performance = 'Fantastic';
    performanceColor = '#d119e5';
  }
  return <div>
    <WorkBar>
      <Bar style={{background: '#fff'}}><BarFill style={{width: `${props.player.performance}%`, background: 'linear-gradient(to bottom, #eeeeee 0%,#cccccc 100%)'}} /></Bar>
      <PerformanceLabel>Performance: <span style={{color: performanceColor}}>{performance}</span></PerformanceLabel>
    </WorkBar>
    <div>
      {[...Array(props.player.tasks)].map((i) => {
        return <WorkButton key={i} onClick={() => {window.paused ? '' : props.work() }}>Work</WorkButton>;
      })}
    </div>
  </div>;
}

const mapStateToProps = (state, props) => {
    return state;
};

const mapActionsToProps = {
  work: () => {
    return {
      type: 'player:work'
    };
  }
}

export default connect(mapStateToProps, mapActionsToProps)(Work);
