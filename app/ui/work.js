import React from 'react';
import {connect} from 'react-redux';
import { Bar, BarFill } from './styles'
import config from 'config';
import styled from 'styled-components';

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
  return <div>
    <WorkBar>
      <Bar><BarFill style={{width: `${props.player.performance}%`}} /></Bar>
      <PerformanceLabel>Performance</PerformanceLabel>
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
