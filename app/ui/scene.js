import * as THREE from 'three';
import {findDOMNode} from 'react-dom';
import React, {Component} from 'react';
import InteractionLayer from './3d/interact';
import ThreeScene from './3d/scene';
import {connect} from 'react-redux';
import Graph from './3d/graph';

import jobs from '../../data/jobs.json';

class Scene extends Component {
  componentDidMount() {
    this.element = findDOMNode(this);
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;
    this.scene = new ThreeScene({
      width: width,
      height: height
    });
    this.element.appendChild(this.scene.renderer.domElement);

    this.graph = new Graph(jobs, 6);
    this.graph.reveal(1);
    this.scene.add(this.graph.group);
    this.ixn = new InteractionLayer(this.scene, this.graph.interactables);
    this.start();
  }

  componentWillUnmount() {
    this.stop();
    this.element.removeChild(this.renderer.domElement);
  }

  render() {
    return <div></div>;
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  animate() {
    this.scene.render();
    this.frameId = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }
}

const mapStateToProps = (state, props) => {
    return state;
};

const mapActionsToProps = {
  setJob: (job) => {
    return {
      type: 'player:hire',
      payload: job
    };
  }
};

export default connect(mapStateToProps, mapActionsToProps)(Scene);
