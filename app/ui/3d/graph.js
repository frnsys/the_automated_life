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
  constructor(jobs, cellSize) {
    this.lineMat = new MeshLineMaterial({
      lineWidth: 0.005,
      color: 0x0000ff,
      resolution: resolution,
      sizeAttenuation: true
    });
    this.cellSize = cellSize;
    this.group = new THREE.Group();

    this.edges = {};
    this.nodes = Object.keys(jobs).map(id => {
      let j = jobs[id];
      let node = new Cell(j.pos.x, j.pos.y, this.cellSize, 0xff0000, {
        name: j.name,
        onClick: () => {
          this.reveal(id);
        }
      });

      // All hidden by default
      node.mesh.visible = false;

      this.edges[id] = {};
      this.group.add(node.mesh);
      return {id: id, node: node};
    }).reduce((acc, n) => {
      acc[n.id] = n.node;
      return acc;
    }, {});

    // Edges
    Object.keys(jobs).map(id => {
      let j = jobs[id];
      let n = this.nodes[id];
      j.similar.slice(0, 2).map(k => {
        if (!this.edges[id][k]) {
          let m = this.nodes[k];
          let edgeMesh = makeEdge([[n.x, n.y], [m.x, m.y]], this.lineMat);
          edgeMesh.visible = false;
          this.edges[id][k] = edgeMesh;
          this.edges[k][id] = edgeMesh;
          this.group.add(edgeMesh);
        }
      });
    });

    this.interactables = Object.values(this.nodes).map(n => n.mesh);
  }

  reveal(job_id) {
    this.nodes[job_id].mesh.visible = true;
    Object.keys(this.edges[job_id]).map(neighb => {
      this.nodes[neighb].mesh.visible = true;
      this.edges[job_id][neighb].visible = true;
    });
  }
}

export default Graph;
