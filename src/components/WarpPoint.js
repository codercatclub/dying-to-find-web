import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const WarpPoint = {
  schema: {
    exitWarpId: { type: 'string', default: 'warp1' },
    triggerRadius: {default: 20}
  },

  init: function () {
    const exitWarp = document.querySelector(`${this.data.exitWarpId}`);
    
    this.el.addEventListener('object3dset', (event) => {
      const mesh = event.target.object3D.getObjectByProperty('type', 'Mesh');
      this.enterPoint = new THREE.Vector3();
      mesh.getWorldPosition(this.enterPoint);
    });

    exitWarp.addEventListener('object3dset', (event) => {
      const mesh = event.target.object3D.getObjectByProperty('type', 'Mesh');
      this.exitPoint = new THREE.Vector3();
      this.exitDir = new THREE.Vector3();
      mesh.getWorldPosition(this.exitPoint);
      mesh.getWorldDirection(this.exitDir);
      this.exitPoint.add(this.exitDir.multiplyScalar(this.data.triggerRadius + 5));
    });

  },

  tick: function (time, timeDelta) {

    if(!(this.enterPoint && this.exitPoint)) return;
    if(!this.moverComponent) {
      this.moverComponent = document.querySelector('#camera').components.mover;
      return;
    }
    let pos = this.moverComponent.camera.position;
    let dist = pos.distanceTo(this.enterPoint);
    if(dist < this.data.triggerRadius)
    {
      this.moverComponent.Teleport(this.exitPoint);
    }
  },
};

export default WarpPoint;
