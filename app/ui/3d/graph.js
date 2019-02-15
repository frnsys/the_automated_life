import Cell from './cell';
import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

const radius = 42;
const resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

function makeEdge(points, lineMat) {
  let geo = new THREE.Geometry();
  let line = new MeshLine();
  points.forEach(p => {
    let [x, y] = p;
    let v = new THREE.Vector3(x, y, -1);
    geo.vertices.push(v);
  });
  line.setGeometry(geo);
  return new THREE.Mesh(line.geometry, lineMat);
}

class Graph {
  constructor(cellSize, camera) {
    this.lineMat = new MeshLineMaterial({
      opacity: 0.5,
      lineWidth: 0.005,
      color: 0x0000ff,
      resolution: resolution,
      sizeAttenuation: true
    });
    this.group = new THREE.Group();
    this.cells = [];
    this.edges = [];
    this.interactables = [];
    this.cellSize = cellSize;
    this.setFocus(0, 0, camera);
  }

  setFocus(cx, cy, camera) {
    this.cells.map(c => this.group.remove(c.mesh));
    this.edges.map(e => this.group.remove(e));
    this.cells.splice(0, this.cells.length);
    this.edges.splice(0, this.edges.length);

    let focal = new Cell(cx, cy, this.cellSize, 0xff0000, {
        name: `${cx}_${cy}`,
    });
    this.group.add(focal.mesh);
    this.cells.push(focal);

    let nAdjacent = 6;
    let interval = (2*Math.PI)/nAdjacent;
    [...Array(nAdjacent).keys()].map(i => {
      let theta = i * interval;
      let x = cx + (Math.cos(theta) * radius);
      let y = cy + (Math.sin(theta) * radius);
      let cell = new Cell(x, y, this.cellSize, 0x0000ff, {
        name: `${x}_${y}`,
        onClick: () => {
          // camera.position.setX(x);
          // camera.position.setY(y);
          this.setFocus(x, y, camera);
        }
      });
      this.group.add(cell.mesh);
      let edgeMesh = makeEdge([[cx, cy], [x, y]], this.lineMat);
      this.group.add(edgeMesh);
      this.edges.push(edgeMesh);
      this.cells.push(cell);
    });

    this.interactables.splice(0, this.interactables.length);
    this.cells.forEach((c) => {
      this.interactables.push(c.mesh);
    });
  }
}

export default Graph;