import React from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';
import util from '../util';

const HUDElement = styled('div')`
  position: fixed;
  z-index: 1000;
  left: 1em;
  top: 1em;
  background: rgba(0,0,0,0.8);
  border-radius: 0.5em;
  color: #fff;
  padding: 0.5em;
  max-width: 200px;
  max-height: 200px;
`;


const HUD = (props) => {
  let date = util.timeToDate(props.time);
  return (
    <HUDElement>
      <div>Time: {date.month}/{date.year}</div>
      <div>Cash: ${props.player.cash.toFixed(2)}</div>
      <div>Job: {props.player.job.name}</div>
      <div>Wage: ${props.player.job.wage.toFixed(2)}</div>
    </HUDElement>
  );
}


const mapStateToProps = (state, props) => {
  return {
    time: state.time,
    player: state.player,
  };
};

export default connect(mapStateToProps)(HUD);
