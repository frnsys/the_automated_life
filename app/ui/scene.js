import * as THREE from 'three';
import {findDOMNode} from 'react-dom';
import React, {Component} from 'react';
import InteractionLayer from './3d/interact';
import Grid from './3d/grid';
import ThreeScene from './3d/scene';

const map = [
  'a a a a a a',
  ' a a a a o o',
  'o o o o o o',
  ' o g g g g o',
  'o o g g g o',
  ' o o f f f f o',
  'o o f f f o',
  ' o o d d d d o'
].map((row) => row.trim().split(' '));


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

    const grid = Grid.fromMap(map, 40);
    this.scene.add(grid.group);
    this.ixn = new InteractionLayer(this.scene, grid.cells.map((c) => c.mesh));
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

export default Scene;
