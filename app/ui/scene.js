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
  if (zoom < cam.zoom) {
    cam.zoom = zoom;
    cam.updateProjectionMatrix();
  }
}

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

    let camera = this.scene.camera;
    graph.onReveal = (focusNode, bounds, center) => {
      if (center) {
        camera.position.set(focusNode.x, focusNode.y, camera.position.z);
        this.scene.controls.target.set(focusNode.x, focusNode.y, 0);
        this.scene.controls.update();
      }
      zoomToFit(bounds, camera, 10);
    };
    this.scene.add(graph.group);

    this.ixn = new InteractionLayer(this.scene, graph.interactables);
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
