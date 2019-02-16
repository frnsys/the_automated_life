import * as THREE from 'three';

const colorCache = {};
const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });

class Node {
  constructor(x, y, size, color, data) {
    this.x = x;
    this.y = y;
    this.data= data || {};

    this.geometry = makeHexagon(x, y, size);
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.setColor(color);

    // to recover this object from raycasting intersection
    this.mesh.obj = this;
  }

  // color order:
  // top right, top center, top left, bottom left, bottom center, bottom right
  setColor(color) {
    let colors = [
      color,
      color,
      shadeColor(color, 0.3),
      color,
      color,
      shadeColor(color, -0.2),
    ];

    colors = colors.map((c) => {
      if (!(c in colorCache)) {
        colorCache[c] = new THREE.Color(c);
      }
      return colorCache[c];
    });

    let triangles = THREE.ShapeUtils.triangulateShape(this.geometry.vertices, []);
    this.geometry.faces.forEach((face, i) => {
      face.vertexColors[0] = colors[triangles[i][0]];
      face.vertexColors[1] = colors[triangles[i][1]];
      face.vertexColors[2] = colors[triangles[i][2]];
    });
    this.geometry.elementsNeedUpdate = true

  }
}

function makeHexagon(x, y, size) {
  let vertices = [];
  let geometry = new THREE.Geometry();
  geometry.dynamic = true;
  for (let i=0; i<6; i++) {
    let angle_deg = 60 * i + 30;
    let angle_rad = Math.PI / 180 * angle_deg;
    let vx = x + size * Math.cos(angle_rad);
    let vy = y + size * Math.sin(angle_rad);
    vertices.push(new THREE.Vector3(vx, vy, 0));
  }
  geometry.vertices = vertices;
  let triangles = THREE.ShapeUtils.triangulateShape(vertices, []);
  for(let i=0; i<triangles.length; i++) {
    let face = new THREE.Face3(triangles[i][0], triangles[i][1], triangles[i][2]);
    geometry.faces.push(face);
  }
  return geometry;
}

function shadeColor(color, percent) {
  let f=color,t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return 0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B);
}

export default Node;
