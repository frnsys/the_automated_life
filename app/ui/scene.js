import * as THREE from 'three';
import {findDOMNode} from 'react-dom';
import React, {Component} from 'react';
import InteractionLayer from './3d/interact';
import ThreeScene from './3d/scene';
import {connect} from 'react-redux';
import Graph from './3d/graph';

import jobs from '../../data/jobs.json';
import nodes from '../../data/nodes.json';

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

    let edges = [];
    Object.keys(jobs).forEach(id => {
      jobs[id].similar.forEach(id_ => {
        let edge = [id, id_].sort().join('_');
        edges.push(edge);
      });
      edges = [...new Set(edges)];
    });

    this.graph = new Graph(nodes, edges, 1);
    const interactables = this.graph.nodes.map((c) => c.mesh);
    this.scene.add(this.graph.group);
    this.ixn = new InteractionLayer(this.scene, interactables);
    this.start();
    console.log(this.graph.nodes[0]);
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
    // Only render edges that have a node in
    // the camera view
    let camera = this.scene.camera;
    camera.updateMatrix();
    camera.updateMatrixWorld();
    let frustum = new THREE.Frustum();
    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    let visible = this.graph.nodes.filter(n => frustum.containsPoint({x: n.x, y: n.y, z: 0})).map(n => n.id);
    this.graph.edges.forEach(e => {
      let [a, b] = e.userData.nodes;
      e.visible = visible.includes(a) || visible.includes(b);
    });

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
