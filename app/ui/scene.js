import * as THREE from 'three';
import {findDOMNode} from 'react-dom';
import React, {Component} from 'react';
import InteractionLayer from './3d/interact';
import ThreeScene from './3d/scene';
import {connect} from 'react-redux';
import graph from './3d/graph';

// Compute and apply necessary zoom
// to contain the specified bounds, w/ padding
function zoomToFit(bounds, cam, padding) {
  let x = cam.position.x;
  let y = cam.position.y;
  let cx = ( cam.right + cam.left ) / 2;
  let cy = ( cam.top + cam.bottom ) / 2;

  let r_l = cam.right - cam.left;
  let t_b = cam.top - cam.bottom;
  let zoomLeft = -(r_l)/(2*((bounds.left-padding) - cx - x));
  let zoomRight = (r_l)/(2*((bounds.right+padding) - cx - x));
  let zoomTop = -(t_b)/(2*((bounds.top+padding) - cy - y));
  let zoomBottom = (t_b)/(2*((bounds.bottom-padding) - cy - y));
  let zooms = [zoomLeft, zoomRight, zoomTop, zoomBottom];
  let zoom = Math.min(...zooms.map(Math.abs));
  cam.zoom = zoom;
  cam.updateProjectionMatrix();
}

class Scene extends Component {
  componentDidMount() {
    this.element = findDOMNode(this);
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;
    this.element.addEventListener('dblclick', () => {
      this.scene.camera.zoom *= 1.5;
      this.scene.camera.zoom = Math.min(this.scene.camera.zoom, this.scene.controls.maxZoom);
      this.scene.camera.updateProjectionMatrix();
      this.scene.controls.update();
    });
    this.scene = new ThreeScene({
      width: width,
      height: height
    });
    this.element.appendChild(this.scene.renderer.domElement);

    let camera = this.scene.camera;
    let graph = this.props.graph;
    graph.onReveal = (focusNode, bounds, {center=true, fit=true}) => {
      if (center) {
        camera.position.set(focusNode.x, focusNode.y, camera.position.z);
        this.scene.controls.target.set(focusNode.x, focusNode.y, 0);
        this.scene.controls.update();
      }
      if (fit) {
        zoomToFit(bounds, camera, 10);
      }
    };
    graph.zoomToAll = () => {
      let {center, bounds} = graph.revealedBounds();
      camera.position.set(center.x, center.y, camera.position.z);
      this.scene.controls.target.set(center.x, center.y, 0);
      this.scene.controls.update();
      zoomToFit(bounds, camera, 10);
    };
    graph.zoomToCurrent = () => {
      let spec = graph.localBounds();
      if (spec) {
        let {center, bounds} = spec;
        camera.position.set(center.x, center.y, camera.position.z);
        this.scene.controls.target.set(center.x, center.y, 0);
        this.scene.controls.update();
        zoomToFit(bounds, camera, 10);
      } else {
        // No current job, show full map
        graph.zoomToAll();
      }
    };
    graph.init(this.props.jobs);
    this.scene.add(graph.group);
    this.graph = graph;

    this.ixn = new InteractionLayer(this.scene, graph.interactables);
    this.start();
  }

  componentWillUnmount() {
    this.stop();
    this.element.removeChild(this.scene.renderer.domElement);
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

    // Position and scale annotation layer
    let camera = this.scene.camera;
    var width = window.innerWidth, height = window.innerHeight;
    var widthHalf = width / 2, heightHalf = height / 2;

    let pos = new THREE.Vector3(0, 0, 0);
    pos.project(camera);
    pos.x = ( pos.x * widthHalf ) + widthHalf;
    pos.y = - ( pos.y * heightHalf ) + heightHalf;

    let pos2 = new THREE.Vector3(1, 1, 0);
    pos2.project(camera);
    pos2.x = ( pos2.x * widthHalf ) + widthHalf;
    pos2.y = - ( pos2.y * heightHalf ) + heightHalf;
    let d = pos.distanceTo(pos2);

    // this.graph.annos.style.transform = `scale(${d/1.448})`;
    this.graph.annos.style.top = `${pos.y}px`;
    this.graph.annos.style.left = `${pos.x}px`;
    this.graph.annos.style.fontSize = `${d*15}px`;

    this.frameId = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }
}

export default Scene;
