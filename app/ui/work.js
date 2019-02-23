import React from 'react';
import {connect} from 'react-redux';
import { Bar, BarFill } from './styles'
import config from 'config';

const Work = (props) => {
  return <div>
    <h1 onClick={props.work}>WORK</h1>
    <Bar><BarFill style={{width: `${props.player.performance}%`}} /></Bar>
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
