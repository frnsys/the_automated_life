import t from 'i18n';
import log from 'log';
import Node from './node';
import * as THREE from 'three';
import skills from 'data/skills.json'
import logic from '../../logic';
import store from 'store';
import jobs from 'data/jobs.json';
import education from 'data/education.json';
import config from 'config';

const topNSkills = 9;
const topNNeighbors = 6;
const visitedColor = 0x51728c;
const unfocusedColor = 0xdfdfdf;
const focusedColor = 0x0e55ef;
const appliedColor = 0xf9ca2f;
const neighbColor = 0x4fc6ea;
const distNeighbColor = 0xd7e4e8;

const satisfactions = [
  'Achievement',
  'Independence',
  'Recognition',
  'Relationships',
  'Support',
  'Working_Conditions'
];
const satisfactionColors = [
  '#33dd60',
  '#aae03e',
  '#d0e041',
  '#e09e41',
  '#ed4731'
];

const tooltip = (job) => {
  let {player, robots} = store.getState();

  let automatedSkills = Object.values(robots).reduce((acc, r) => {
    return acc.concat(r.skills);
  }, []);

  let risk = t('low');
  if (job.automationRisk >= 0.7) {
    risk = t('high');
  } else if (job.automationRisk >= 0.4) {
    risk = t('moderate');
  }
  let automated = logic.percentAutomated(job);
  let hadJob = player.pastJobs.includes(job.id);
  let applied = player.application && player.application.id == job.id;

  let requiredSkills = Object.keys(job.skills)
    .sort((id_a, id_b) => job.skills[id_b] - job.skills[id_a])
    .map(id => skills[id]).slice(0, topNSkills);

  let wageChange = Math.round((job.wageAfterTaxes - job.baseWageAfterTaxes)/12);
  let jobAnno = '';
  if (hadJob) {
    jobAnno = ` (${t('past_job')})`;
  } else if (player.job && player.job.id == job.id) {
    jobAnno = ` (${t('current_job')})`;
  }

  let satisfaction = job.satisfaction.length/satisfactions.length;
  let satisfactionLevel = '';
  let satisfactionColor = '';
  if (satisfaction > 0.8) {
    satisfactionLevel = 'Fulfilling';
    satisfactionColor = satisfactionColors[0];
  } else if (satisfaction > 0.6) {
    satisfactionLevel = 'Rewarding';
    satisfactionColor = satisfactionColors[1];
  } else if (satisfaction > 0.4) {
    satisfactionLevel = 'Satisfying';
    satisfactionColor = satisfactionColors[2];
  } else if (satisfaction > 0.2) {
    satisfactionLevel = 'Demoralizing';
    satisfactionColor = satisfactionColors[3];
  } else if (satisfaction > 0) {
    satisfactionLevel = 'Soul-Crushing';
    satisfactionColor = satisfactionColors[4];
  }

  return `
    <div class="job-tooltip">
      ${applied ? `<div class="job-applied">${t('application_out')}</div>` : ''}
      <h3>${automated >= 0.5 ? '🤖 ' : ''}${job.name}${jobAnno}</h3>
      <h5>
        <div>
          $${Math.round(job.wageAfterTaxes/12).toLocaleString()}/${t('month_unit')}
          ${wageChange != 0 ? `<span style="font-size:0.8em;opacity:0.7;"><span style="color:${wageChange < 0 ? '#ff0000' : '#39e567'};">${wageChange < 0 ? '-' : '+'}$${Math.abs(wageChange).toLocaleString()}</span> due to automation</span>` : ''}
        </div>
        ${config.jobSatisfaction ? `<div class="job-satisfaction" style='background:${satisfactionColor};'>${satisfactionLevel}</div>` : ''}
      </h5>
      <div class="job-industries">${job.industries.map((ind) => `<div>${config.industryIcons[ind]} ${ind.replace(' (Except Public Administration)', '')}</div>`).join(' ')}</div>
      <div class="job-status">
        <div class="job-risk job-risk-${risk}">${t('automation_risk')}: ${risk}</div>
        <div class="job-automated">${(automated*100).toFixed(0)}% ${t('percent_automated')}</div>
      </div>
      <div class="job-skills">
        <h5><span>${t('important_skills')}</span> <span>≥ 🎓 ${education[job.bestEducation].name}</span></h5>
        <ul>
          ${requiredSkills.map((s) => {
            let risk = t('low');
            if (s.automatibility >= 0.7) {
              risk = t('high');
            } else if (s.automatibility >= 0.4) {
              risk = t('moderate');
            }
            return `<li class="automation-${risk}">${automatedSkills.includes(s.id) ? `<div class="automated"><div>${t('automated')}</div></div>` : ''}${s.name} <div class="skill-level-bar"><div class="skill-level-bar-fill" style="height:${player.skills[s.id] * 100}%;"></div></div></li>`;
          }).join('')}
        </ul>
        <div class="job-legend">
          <div class="automation-legend">
            <div class="automation-low-key"></div> ${t('low_risk_automation')}
            <div class="automation-moderate-key"></div> ${t('mid_risk_automation')}
            <div class="automation-high-key"></div> ${t('high_risk_automation')}
          </div>
          <div class="skill-legend">
            <div class="skill-level-bar"><div class="skill-level-bar-fill"></div></div> ${t('your_skill_level')}
          </div>
        </div>
      </div>
    </div>
  `;
};

const focusedLineMat = new THREE.LineBasicMaterial({
  color: 0x44f48d,
  linewidth: 1
});
const visitedLineMat = new THREE.LineBasicMaterial({
  color: 0xbbbbbb,
  linewidth: 1
});
const appliedLineMat = new THREE.LineBasicMaterial({
  color: appliedColor,
  linewidth: 3
});
const defaultLineMat = new THREE.LineBasicMaterial({
  color: unfocusedColor,
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

            if (this.focusedNodeId) {
              this.edges[this.focusedNodeId][id].material = appliedLineMat;
            }
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

      j.similar.slice(0, topNNeighbors).map(k => {
        // Create edge only if we haven't
        // already created it
        if (!this.edges[id][k] && Object.keys(this.edges[k]).length < topNNeighbors) {
          let m = this.nodes[k];
          let edgeMesh = makeLine([[n.x, n.y], [m.x, m.y]]);
          edgeMesh.visible = false;
          this.edges[id][k] = edgeMesh;
          this.edges[k][id] = edgeMesh;
          this.group.add(edgeMesh);
          this._edges.push(edgeMesh);
        }
      });

      // If there are still no edges, i.e. because
      // it's neighbors already have topNNeighbors edges,
      // just connect them directly
      if (Object.keys(this.edges[id]).length == 0) {
        j.similar.slice(0, topNNeighbors).map(k => {
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
      }
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

    if (this.focusedNodeId && this.edges[this.focusedNodeId][job_id]) {
      this.edges[this.focusedNodeId][job_id].visited = true;
    }

    this.focusedNodeId = job_id;

    // Set all nodes and edges to muted
    Object.values(this.nodes)
      .filter(n => n.mesh.visible)
      .forEach(n => {
        if (player.pastJobs.includes(n.data.id)) {
          n.mesh.position.setZ(1);
        } else {
          n.mesh.position.setZ(0);
        }
        this.resetNodeColor(n, player);
        n.anno.style.display = 'none';
      });
    Object.values(this._edges)
      .filter(e => e.visible)
      .forEach(e => {
        e.position.setZ(0);
        if (e.visited) {
          e.position.setZ(1);
          e.material = visitedLineMat;
        } else {
          e.material = defaultLineMat;
        }
      });

    // If unemployed or student, job_id is null
    if (job_id === null) return;

    // Set outward edges to visible,
    // and color neighboring nodes
    let focusNode = this.nodes[job_id];
    let bounds = {
      left: focusNode.x,
      top: focusNode.y,
      right: focusNode.x,
      bottom: focusNode.y
    };

    let hops = 1;
    if (config.twoHops) {
      hops = 2;
    }
    bounds = this.revealNeighbors(job_id, player, bounds, hops);

    // Set focus node color
    focusNode.mesh.visible = true;
    focusNode.anno.style.display = 'block';
    focusNode.setColor(focusedColor);
    focusNode.mesh.position.setZ(2);

    this.onReveal(focusNode, bounds, center);
  }

  revealNeighbors(job_id, player, bounds, hops, immediateNeighbs, focusId) {
    let neighbors = Object.keys(this.edges[job_id]);
    let toReveal = [...neighbors];

    if (!immediateNeighbs) {
      immediateNeighbs = toReveal;
    }
    if (!focusId) {
      focusId = job_id;
    }

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
        if (immediateNeighbs.includes(neighb)) {
          node.setColor(neighbColor);
        } else {
          node.setColor(distNeighbColor);
        }
      }
      node.mesh.position.setZ(2);

      let line = this.edges[job_id][neighb];
      line.visible = true;
      if (immediateNeighbs.includes(neighb) || neighb == focusId) {
        line.material = focusedLineMat;
      } else {
        line.material = defaultLineMat;
      }
      line.position.setZ(2);
    });

    hops--;
    if (hops == 0) {
      return bounds;
    } else {
      let boundses = neighbors.map((job_id) => {
        return this.revealNeighbors(job_id, player, bounds, hops, immediateNeighbs, focusId);
      });
      boundses.forEach((b) => {
        bounds.left = Math.min(b.left, bounds.left);
        bounds.bottom = Math.min(b.bottom, bounds.bottom);
        bounds.right = Math.max(b.right, bounds.right);
        bounds.top = Math.max(b.top, bounds.top);
      });
      return bounds;
    }
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

  resetEdgeColor(nodeId, nodeId_) {
    let edge = this.edges[nodeId][nodeId_];
    let neighbIds = this.focusedNodeId ? Object.keys(this.edges[this.focusedNodeId]) : [];
    if (edge) {
      if (edge.visited) {
        edge.material = visitedLineMat;
      } else if (neighbIds.includes(nodeId_.toString())) {
        edge.material = focusedLineMat;
      } else {
        edge.material = defaultLineMat;
      }
    }
  }
}


const nodeSize = 6;
const graph = new Graph(jobs, nodeSize);

// For exporting job-job network
// let network = Object.keys(graph.edges).reduce((acc, id) => {
//   let to_nodes = Object.keys(graph.edges[id]);
//   acc[id] = to_nodes;
//   return acc;
// }, {});
// console.log(JSON.stringify(network));

export default graph;
