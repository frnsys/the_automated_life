import Cell from './cell';
import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

const resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
const baseScale = 200;

const arrayToObject = (array) =>
   array.reduce((obj, item) => {
     obj[item.id] = item
     return obj
   }, {})

function makeEdge(points, lineMat) {
  let geo = new THREE.Geometry();
  let line = new MeshLine();
  points.forEach(p => {
    let [x, y] = p;
    let v = new THREE.Vector3(x*baseScale, y*baseScale, -1);
    geo.vertices.push(v);
  });
  line.setGeometry(geo);
  return new THREE.Mesh(line.geometry, lineMat);
}

class Graph {
  constructor(nodes, edges, cellSize) {
    this.lineMat = new MeshLineMaterial({
      opacity: 0.5,
      lineWidth: 0.005,
      color: 0x0000ff,
      resolution: resolution,
      sizeAttenuation: true
    });
    this.group = new THREE.Group();
    this.nodes = nodes.map(n => {
      let [x, y] = n.position;
      let cell = new Cell(x*baseScale, y*baseScale, cellSize, 0xff0000, n.data);
      this.group.add(cell.mesh);
      cell.id = n.id;
      return cell;
    });

    let nodeLookup = arrayToObject(nodes);
    this.edges = edges.map(edge => {
      let [a, b] = edge.split('_');
      a = parseInt(a), b = parseInt(b);
      let pt_a = nodeLookup[a].position;
      let pt_b = nodeLookup[b].position;
      let edgeMesh = makeEdge([pt_a, pt_b], this.lineMat);
      edgeMesh.userData.nodes = [a, b];
      this.group.add(edgeMesh);
      return edgeMesh;
    });
  }
}

export default Graph;
