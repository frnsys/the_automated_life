import * as THREE from 'three';
import {findDOMNode} from 'react-dom';
import React, {Component} from 'react';
import InteractionLayer from './3d/interact';
import Grid from './3d/grid';
import ThreeScene from './3d/scene';
import {connect} from 'react-redux';


class Scene extends Component {
  gridFromJob(job, cellSize) {
    let adjacent = [
      [-1, 0],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1]
    ];
    let nRows = 3, nCols = 3;
    let grid = new Grid(nCols, nRows, cellSize);
    let cx = Math.floor(nCols/2), cy = Math.floor(nRows/2);

    job.similar.map((id, i) => {
      let [col, row] = adjacent[i];
      let j = this.props.jobs[id];
      let data = {
        tooltip: `<h5>${j.name}</h5><h6>Wage: ${j.wage}</h6>`,
        onClick: () => {
          return this.props.setJob(j);
        }
      };
      col = cx+col, row = cy+row;
      grid.setCellAt(col, row, 0xff0000, data);
    });
    let data = {
        tooltip: `<h5>${job.name}</h5><h6>Wage: ${job.wage}</h6>`
    };
    grid.setCellAt(cx, cy, 0x0000ff, data);

    return grid;
  }

  componentDidMount() {
    this.element = findDOMNode(this);
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;
    this.scene = new ThreeScene({
      width: width,
      height: height
    });
    this.element.appendChild(this.scene.renderer.domElement);
    console.log(this.props);

    // TODO starting from arbitrary job
    const grid = this.gridFromJob(this.props.jobs['0'], 32);
    const interactables = grid.cells.filter(Boolean).map((c) => c.mesh);
    this.scene.add(grid.group);
    this.ixn = new InteractionLayer(this.scene, interactables);
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
