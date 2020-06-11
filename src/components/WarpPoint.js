import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const WarpPoint = {
  schema: {
    exitWarpId: { type: 'string', default: 'warp1' },
    triggerRadius: {default: 10}
  },

  init: function () {
    this.moverComponent = document.querySelector('#camera').components.mover;
    const exitWarp = document.querySelector(`#${this.data.exitWarpId}`);
    
    this.el.addEventListener('object3dset', (event) => {
      this.enterPoint = new THREE.Vector3();
      event.target.object3D.getWorldPosition(this.enterPoint);
    });

    exitWarp.addEventListener('object3dset', (event) => {
      this.exitPoint = new THREE.Vector3();
      event.target.object3D.getWorldPosition(this.exitPoint);
    });

  },

  tick: function (time, timeDelta) {

    if(!(this.enterPoint && this.exitPoint)) return;
    let pos = this.moverComponent.camera.position;
    let dist = pos.distanceTo(this.enterPoint);
    if(dist < this.data.triggerRadius)
    {
      this.moverComponent.Teleport(this.exitPoint);
    }
  },
};

export default WarpPoint;
