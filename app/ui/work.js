import config from '../config';
import {connect} from 'react-redux';
import React, {Component} from 'react';

import { Bar, BarFill } from './styles'

class Work extends Component {
  render() {
    return <div>
      <h1 onClick={this.props.work}>WORK</h1>
      <Bar><BarFill style={{width: `${this.props.player.performance}%`}} /></Bar>
    </div>;
  }
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
