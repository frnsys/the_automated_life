import Node from './node';
import * as THREE from 'three';

const radius = 42;
const lineMat = new THREE.LineBasicMaterial({
  color: 0x888888,
  linewidth: 1
});

function makeLine(points) {
  let geo = new THREE.Geometry();
  points.forEach(p => {
    let [x, y] = p;
    let v = new THREE.Vector3(x, y, -1);
    geo.vertices.push(v);
  });
  return new THREE.Line(geo, lineMat);
}

class Graph {
  constructor(jobs, nodeSize) {
    this.nodeSize = nodeSize;
    this.group = new THREE.Group();

    this.edges = {};

    // Create mapping of job_id->node
    this.nodes = Object.keys(jobs).map(id => {
      let j = jobs[id];
      let node = new Node(j.pos.x, j.pos.y, this.nodeSize, 0xff0000, {
        onClick: () => {
          this.reveal(id);
        },
        tooltip: j.name
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

    // Create edges
    Object.keys(jobs).map(id => {
      let j = jobs[id];
      let n = this.nodes[id];

      // TODO remove restriction
      j.similar.slice(0, 2).map(k => {
        // Create edge only if we haven't
        // already created it
        if (!this.edges[id][k]) {
          let m = this.nodes[k];
          let edgeMesh = makeLine([[n.x, n.y], [m.x, m.y]]);
          edgeMesh.visible = false;
          this.edges[id][k] = edgeMesh;
          this.edges[k][id] = edgeMesh;
          this.group.add(edgeMesh);
        }
      });
    });

    // All nodes are interactable
    this.interactables = Object.values(this.nodes).map(n => n.mesh);
  }

  // Reveal the node and its neighbors
  // for the given job id
  reveal(job_id) {
    // Set all nodes to muted
    Object.values(this.nodes)
      .filter(n => n.mesh.visible)
      .forEach(n => n.setColor(0x888888));

    // Set focus node color
    this.nodes[job_id].mesh.visible = true;
    this.nodes[job_id].setColor(0x0000ff);

    // Set outward edges to visible,
    // and color neighboring nodes
    Object.keys(this.edges[job_id]).map(neighb => {
      this.nodes[neighb].mesh.visible = true;
      this.nodes[neighb].setColor(0xff0000);
      this.edges[job_id][neighb].visible = true;
    });
  }
}

export default Graph;
