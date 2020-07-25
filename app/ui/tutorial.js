import t from 'i18n';
import config from 'config';
import React, { Component } from 'react';

class Tutorial extends Component {
  constructor() {
    this.state = {
      step: 0
    };

    // Hack to advance the tutorial throughout the game
    window.tutorial = this;
  }

  startGame() {
    this.props.togglePause();
    this.props.closeModal();
  }

  componentWillMount() {
    if (!window.paused) {
      this.props.togglePause();
    }
  }

  get step() {
    return config.tutorial[this.state.step];
  }

  skip() {
    this.setState({
      step: config.tutorial.length - 1;
    });
  }

  next() {
    if (this.state.step < config.tutorial.length - 1) {
      this.setState({ step: this.state.step + 1 });
    }
  }

  render() {
    return <div>Tutorial</div>;
  }
}

export default Tutorial;
