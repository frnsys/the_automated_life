import React from 'react';
import {connect} from 'react-redux';
import { Bar, BarFill } from './styles'
import config from 'config';
import styled from 'styled-components';

const WorkStyle = styled('div')`
  position: fixed;
  z-index: 2000;
  right: 1em;
  top: 1em;
  color: #000;
  border: 2px solid black;
  user-select: none;
`;

const WorkButton = styled('div')`
  color: #fff;
  background: #ea432a;
  padding: 0.25em 0.5em;
  cursor: pointer;
  user-select: none;
  &:hover {
    background: #fe0f0f;
  }
`;

const PerformanceLabel = styled('div')`
  position: absolute;
  left: 0.5em;
  bottom: 0;
  color: #000;
  font-size: 0.9em;
`;


const Work = (props) => {
  // Don't show work minigame if not employed
  let job = props.player.job.name;
  if (job == 'Unemployed' || job == 'Student') {
    return <div></div>;
  }
  return <WorkStyle>
    <WorkButton onClick={props.work}>WORK</WorkButton>
    <Bar><BarFill style={{width: `${props.player.performance}%`}} /></Bar>
    <PerformanceLabel>Performance</PerformanceLabel>
  </WorkStyle>;
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
