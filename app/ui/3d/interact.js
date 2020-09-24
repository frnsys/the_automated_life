import * as THREE from 'three';
const tooltip = document.createElement('div');
tooltip.id = 'graph-tooltip';
tooltip.classList.add('tooltip');
tooltip.style.position = 'fixed';
tooltip.style.display = 'none';
tooltip.style.zIndex = '11';
tooltip.style.pointerEvents = 'none';
document.body.appendChild(tooltip);

class InteractionLayer {
  constructor(scene, selectables) {
    this.scene = scene;
    this.selectables = selectables;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.focused = null;

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

    let intersects = this.raycaster.intersectObjects(this.selectables.filter(s => s.visible));
    if (intersects.length > 0) {
      let mesh = intersects[0].object,
          pos = intersects[0].point,
          node = mesh.obj;
      if (node.data.onClick) {
        node.data.onClick();
      }
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
      if (mesh.visible) {
        if (obj.data.tooltip) {
          tooltip.style.display = 'block';
          // tooltip.style.left = `${ev.pageX + 5}px`;
          // let top = ev.pageY + 5;
          // if (tooltip.clientHeight + top > window.innerHeight) {
          //   top -= tooltip.clientHeight;
          // }
          // tooltip.style.top = `${top}px`;
          if (typeof obj.data.tooltip === 'function') {
            tooltip.innerHTML = obj.data.tooltip();
          } else {
            tooltip.innerHTML = obj.data.tooltip;
          }
        }
        if (obj.data.onMouseOver && this.focused != obj) {
          if (this.focused && this.focused.data.onMouseOut) {
            this.focused.data.onMouseOut();
          }
          obj.data.onMouseOver();
          this.focused = obj;
        }
      }
    } else {
      if (this.focused && this.focused.data.onMouseOut) {
        this.focused.data.onMouseOut();
      }
      this.focused = null;
      if (!tooltip.dataset.sticky) {
        tooltip.style.display = 'none';
      }
    }
  }
}

export default InteractionLayer;
