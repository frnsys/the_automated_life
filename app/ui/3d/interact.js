import * as THREE from 'three';
const tooltip = document.createElement('div');
tooltip.classList.add('tooltip');
tooltip.style.position = 'absolute';
tooltip.style.padding = '0.3em 0.6em';
tooltip.style.background = '#333';
tooltip.style.color = '#fff';
tooltip.style.display = 'none';
tooltip.style.zIndex = '10';
tooltip.style.pointerEvents = 'none';
document.body.appendChild(tooltip);

class InteractionLayer {
  constructor(scene, selectables) {
    this.scene = scene;
    this.selectables = selectables;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.scene.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.scene.renderer.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
    this.scene.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  }

  updateMouse(ev) {
    // adjust browser mouse position for three.js scene
    this.mouse.x = (ev.clientX/this.scene.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(ev.clientY/this.scene.renderer.domElement.clientHeight) * 2 + 1;
  }

  onTouchStart(ev) {
    ev.preventDefault();
    ev.clientX = ev.touches[0].clientX;
    ev.clientY = ev.touches[0].clientY;
    this.onMouseDown(ev);
  }

  onMouseDown(ev) {
    ev.preventDefault();
    this.updateMouse(ev);
    this.raycaster.setFromCamera(this.mouse, this.scene.camera);

    let intersects = this.raycaster.intersectObjects(this.selectables);
    if (intersects.length > 0) {
      let obj = intersects[0].object,
          pos = intersects[0].point;
    }
  }

  onMouseMove(ev) {
    ev.preventDefault();
    this.updateMouse(ev);
    this.raycaster.setFromCamera(this.mouse, this.scene.camera);

    let intersects = this.raycaster.intersectObjects(this.selectables);
    if (intersects.length > 0) {
      let mesh = intersects[0].object,
          pos = intersects[0].point,
          obj = mesh.obj;
      tooltip.style.display = 'block';
      tooltip.style.left = `${ev.pageX + 5}px`;
      let top = ev.pageY + 5;
      if (tooltip.clientHeight + top > window.innerHeight) {
        top -= tooltip.clientHeight;
      }
      tooltip.style.top = `${top}px`;
      if (obj.data.tooltip) {
        tooltip.innerHTML = obj.data.tooltip;
      } else {
        tooltip.innerText = `${obj.col}, ${obj.row} (${obj.data.name})`;
      }
    } else {
      tooltip.style.display = 'none';
    }
  }
}

export default InteractionLayer;
