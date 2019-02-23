import React from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';
import util from '../util';
import { Bar, BarFill } from './styles'

const HUDStyle = styled('div')`
  position: fixed;
  z-index: 1000;
  left: 1em;
  top: 1em;
  color: #000;
  padding: 0.5em;
  max-width: 200px;
  max-height: 200px;
  border: 2px solid black;
  background: #fff;
`;


const HUD = (props) => {
  let date = util.timeToDate(props.time);
  return (
    <HUDStyle>
      <Bar><BarFill style={{width: `${util.timeProgress(props.time)*100}%`}} /></Bar>
      <div>Time: {date.month}/{date.year}</div>
      <div>Cash: ${props.player.cash.toFixed(2)}</div>
      <div>Job: {props.player.job.name}</div>
      <div>Wage: ${props.player.job.wage.toFixed(2)}</div>
    </HUDStyle>
  );
}


const mapStateToProps = (state, props) => {
  return {
    time: state.time,
    player: state.player,
  };
};

export default connect(mapStateToProps)(HUD);
