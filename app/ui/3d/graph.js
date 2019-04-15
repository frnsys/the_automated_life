import log from 'log';
import Node from './node';
import * as THREE from 'three';
import skills from 'data/skills.json'
import logic from '../../logic';
import store from 'store';
import jobs from 'data/jobs.json';
import config from 'config';

const topNSkills = 12;
const visitedColor = 0xf4ed61;
const unfocusedColor = 0xaaaaaa;
const focusedColor = 0x0000ff;
const appliedColor = 0x79d889;
const neighbColor = 0xff0000;

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
  let applied = player.application && player.application.id == job.id;

  let requiredSkills = Object.keys(job.skills)
    .sort((id_a, id_b) => job.skills[id_b] - job.skills[id_a])
    .map(id => skills[id]).slice(0, topNSkills);

  return `
    <div class="job-tooltip">
      ${applied ? `<div class="job-applied">Application Out</div>` : ''}
      <h3>${job.name}${hadJob ? ' (past job)' : ''}</h3>
      <h5>$${Math.round(job.wageAfterTaxes/12).toLocaleString()}/month</h5>
      <div class="job-industries">${job.industries.map((ind) => `<div>${config.industryIcons[ind]} ${ind.replace(' (Except Public Administration)', '')}</div>`).join(' ')}</div>
      <div class="job-status">
        <div class="job-risk job-risk-${risk}">automation risk: ${risk}</div>
        <div class="job-automated">${(automated*100).toFixed(0)}% automated</div>
      </div>
      <div class="job-skills">
        <h5>Important skills</h5>
        <ul>
          ${requiredSkills.map((s) => {
            let risk = 'low';
            if (s.automatibility >= 0.7) {
              risk = 'high';
            } else if (s.automatibility >= 0.4) {
              risk = 'moderate';
            }
            return `<li class="automation-${risk}">${automatedSkills.includes(s.id) ? '<div class="automated"><div>Automated</div></div>' : ''}${s.name} <div class="skill-level-bar"><div class="skill-level-bar-fill" style="height:${player.skills[s.id] * 100}%;"></div></div></li>`;
          }).join('')}
        </ul>
        <div class="job-legend">
          <div class="automation-legend">
            <div class="automation-low-key"></div> low risk
            <div class="automation-moderate-key"></div> mid risk
            <div class="automation-high-key"></div> high risk
          </div>
          <div class="skill-legend">
            <div class="skill-level-bar"><div class="skill-level-bar-fill"></div></div> your skill level
          </div>
        </div>
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
    this.locked = false;

    this.edges = {};

    this.annos = document.createElement('div');
    this.annos.id = 'annotations';
    this.annos.style.position = 'absolute';
    this.annos.style.zIndex = '1';
    this.annos.style.pointerEvents = 'none';
    document.body.appendChild(this.annos);

    if (config.debug) {
      let origin = new Node(0, 0, this.nodeSize, 0x000000);
      this.group.add(origin.mesh);
    }

    // Create mapping of job_id->node
    this.nodes = Object.keys(jobs).map(id => {
      let j = jobs[id];
      let node = new Node(j.pos.x, j.pos.y, this.nodeSize, unfocusedColor, {
        id: parseInt(id),

        // Click on job node to apply to job
        onClick: () => {
          if (window.paused || this.locked) return;
          let {player} = store.getState();
          let valid = false;
          if (this.focusedNodeId) {
            // Can re-apply to any past job
            if (player.pastJobs.includes(parseInt(id))) {
              valid = true;
            } else {
              let neighbIds = Object.keys(this.edges[this.focusedNodeId]);
              valid = neighbIds.includes(id);
            }
          } else {
            valid = true;
          }
          if (!player.application && valid) {
            let {time} = store.getState();
            let {prob, mainFactor, factors} = logic.probabilityForJob(j);
            let payload = {
              id: id,
              prob: prob,
              mainFactor: mainFactor
            }
            store.dispatch({
              type: 'player:apply',
              payload: payload
            });
            log('applied', {
              factors: factors,
              application: payload,
              time: time,
              job: {id: j.id, wage: j.wage}
            });
            this.appliedNode = node;
            node.setColor(appliedColor);
          }
        },
        tooltip: () => tooltip(j)
      });

      // All hidden by default
      node.mesh.visible = false;

      const anno = document.createElement('div');
      anno.classList.add('annotation');
      anno.innerHTML = j.name;

      // node positions seem to become off
      // the further from the origin,
      // this is a hand-adjustment that improves the positioning
      anno.style.top = `${-node.y}px`
      anno.style.left = `${node.x * (node.x > 0 ? 1.04 : 1.01)}px`

      anno.style.display = 'none';
      node.anno = anno;
      this.annos.appendChild(anno);

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

  lock() {
    this.locked = true;
    this.reveal(null);
  }

  unlock(job_id, player=null) {
    this.locked = false;
    if (job_id) {
      this.reveal(job_id, true, player);
    } else {
      Object.values(this.nodes)
        .filter(n => n.mesh.visible)
        .forEach(n => {
          n.mesh.position.setZ(1);
          n.setColor(neighbColor);
          n.anno.style.display = 'block';
        });
    }
  }

  // Reveal the node and its neighbors
  // for the given job id
  reveal(job_id, center=false, player=null) {
    if (!player) {
      player = store.getState().player;
    }
    this.focusedNodeId = job_id;

    // Set all nodes and edges to muted
    Object.values(this.nodes)
      .filter(n => n.mesh.visible)
      .forEach(n => {
        n.mesh.position.setZ(0);
        this.resetNodeColor(n, player);
        n.anno.style.display = 'none';
      });
    Object.values(this._edges)
      .filter(e => e.visible)
      .forEach(e => {
        e.position.setZ(0);
        e.material = defaultLineMat;
      });

    // If unemployed or student, job_id is null
    if (job_id === null) return;

    // Set focus node color
    let focusNode = this.nodes[job_id];
    focusNode.mesh.visible = true;
    focusNode.anno.style.display = 'block';
    focusNode.setColor(focusedColor);
    focusNode.mesh.position.setZ(1);

    // Set outward edges to visible,
    // and color neighboring nodes
    let bounds = {
      left: focusNode.x,
      top: focusNode.y,
      right: focusNode.x,
      bottom: focusNode.y
    };

    let neighbors = Object.keys(this.edges[job_id]);
    let toReveal = [...neighbors];

    // TESTING revealing more than immediate neighbors
    // toReveal = toReveal.map((id) => {
    //   return Object.keys(this.edges[id]);
    // }).reduce((acc, r) => {
    //   return acc.concat(r);
    // }, []).concat(toReveal);
    // toReveal = [...new Set(toReveal)];

    console.log(toReveal);

    toReveal.map(neighb => {
      let node = this.nodes[neighb];
      node.mesh.visible = true;
      node.anno.style.display = 'block';

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

      // Set colors
      if (player.pastJobs.includes(node.data.id)) {
        node.setColor(visitedColor);
      } else if (neighbors.includes(neighb)) {
        node.setColor(neighbColor);
      }
      node.mesh.position.setZ(1);

      let line = this.edges[job_id][neighb];
      line.visible = true;
      line.material = focusedLineMat;
      line.position.setZ(1);
    });
    this.onReveal(focusNode, bounds, center);
  }

  resetNodeColor(node, player) {
    let neighbIds = this.focusedNodeId ? Object.keys(this.edges[this.focusedNodeId]) : [];
    if (player.pastJobs.includes(node.data.id)) {
      node.setColor(visitedColor);
    } else if (neighbIds.includes(node.data.id.toString())) {
      node.setColor(neighbColor);
    } else {
      node.setColor(unfocusedColor);
    }
  }
}


const nodeSize = 6;
const graph = new Graph(jobs, nodeSize);
export default graph;
