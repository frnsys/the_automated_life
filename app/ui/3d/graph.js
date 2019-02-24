import Node from './node';
import * as THREE from 'three';
import skills from 'data/skills.json'
import logic from '../../logic';
import store from '../../store';

const topNSkills = 5;
const visitedColor = 0xf4ed61;
const unfocusedColor = 0xaaaaaa;
const focusedColor = 0x0000ff;
const neighbColor = 0xff0000;
const neighbColorUnqualified = 0x660000;

const tooltip = (job) => {
  let {player, robots} = store.getState();

  let automatedSkills = Object.values(robots).reduce((acc, r) => {
    return acc.concat(r.skills);
  }, []);

  let risk = 'low';
  if (job.automationRisk >= 0.8) {
    risk = 'high';
  } else if (job.automationRisk >= 0.4) {
    risk = 'moderate';
  }
  let automated = logic.percentAutomated(job);
  let hadJob = player.pastJobs.includes(job.id);

  let requiredSkills = Object.keys(job.skills)
    .sort((id_a, id_b) => job.skills[id_b] - job.skills[id_a])
    .map(id => skills[id]).slice(0, topNSkills);

  return `
    <div class="job-tooltip">
      <h3>${job.name}${hadJob ? ' (past job)' : ''}</h3>
      <div class="job-status">
        <div class="job-risk job-risk-${risk}">automation risk: ${risk}</div>
        <div class="job-automated">${(automated*100).toFixed(0)}% automated</div>
      </div>
      <div class="job-skills">
        <h5>Important skills</h5>
        <ul>
          ${requiredSkills.map((s) => {
            let risk = 'low';
            if (s.automatibility >= 0.8) {
              risk = 'high';
            } else if (s.automatibility >= 0.4) {
              risk = 'moderate';
            }
            return `<li class="${automatedSkills.includes(s.id) ? 'automated' : ''}"><div class="automation-icon automation-icon-${risk}"></div>${s.name} ${automatedSkills.includes(s.id) ? '(automated)' : ''}</li>`;
          }).join('')}
        </ul>
      </div>
    </div>
  `;
};

const focusedLineMat = new THREE.LineBasicMaterial({
  color: 0x00ff00,
  linewidth: 1
});
const defaultLineMat = new THREE.LineBasicMaterial({
  color: 0xaaaaaa,
  linewidth: 1
});

function makeLine(points) {
  let geo = new THREE.Geometry();
  points.forEach(p => {
    let [x, y] = p;
    let v = new THREE.Vector3(x, y, -1);
    geo.vertices.push(v);
  });
  return new THREE.Line(geo, defaultLineMat);
}

class Graph {
  constructor(jobs, nodeSize) {
    this.nodeSize = nodeSize;
    this.group = new THREE.Group();

    this.edges = {};

    // Create mapping of job_id->node
    this.nodes = Object.keys(jobs).map(id => {
      let j = jobs[id];
      let node = new Node(j.pos.x, j.pos.y, this.nodeSize, unfocusedColor, {
        id: parseInt(id),

        // Click on job node
        onClick: () => {
          console.log(logic.probabilityForJob(j));
          let job = jobs[id];
          this.onNodeClick(job);
          this.reveal(id);
        },
        tooltip: () => tooltip(j)
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
    this._edges = [];
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
          this._edges.push(edgeMesh);
        }
      });
    });

    // All nodes are interactable
    this.interactables = Object.values(this.nodes).map(n => n.mesh);
  }

  // Reveal the node and its neighbors
  // for the given job id
  reveal(job_id) {
    let {player} = store.getState();
    // Set all nodes and edges to muted
    Object.values(this.nodes)
      .filter(n => n.mesh.visible)
      .forEach(n => {
        n.mesh.position.setZ(0);
        if (player.pastJobs.includes(n.data.id)) {
          n.setColor(visitedColor);
        } else {
          n.setColor(unfocusedColor);
        }
      });
    Object.values(this._edges)
      .filter(e => e.visible)
      .forEach(e => {
        e.position.setZ(0);
        e.material = defaultLineMat;
      });

    // Set focus node color
    let node = this.nodes[job_id];
    node.mesh.visible = true;
    node.setColor(focusedColor);
    node.mesh.position.setZ(1);

    // Set outward edges to visible,
    // and color neighboring nodes
    let bounds = {
      left: node.x,
      top: node.y,
      right: node.x,
      bottom: node.y
    };
    Object.keys(this.edges[job_id]).map(neighb => {
      let node = this.nodes[neighb];
      node.mesh.visible = true;

      // Determine bounding box
      if (node.x < bounds.left) {
        bounds.left = node.x - this.nodeSize;
      }
      if (node.y < bounds.bottom) {
        bounds.bottom = node.y - this.nodeSize;
      }
      if (node.x > bounds.right) {
        bounds.right = node.x + this.nodeSize;
      }
      if (node.y > bounds.top) {
        bounds.top = node.y + this.nodeSize;
      }

      // TODO color by probability of getting job
      // and by level of automation
      if (player.pastJobs.includes(node.data.id)) {
        node.setColor(visitedColor);
      } else if (neighb) {
        node.setColor(neighbColor);
      } else {
        node.setColor(neighbColorUnqualified);
      }
      node.mesh.position.setZ(1);

      let line = this.edges[job_id][neighb];
      line.visible = true;
      line.material = focusedLineMat;
      line.position.setZ(1);
    });
    this.onReveal(bounds);
  }
}

export default Graph;
