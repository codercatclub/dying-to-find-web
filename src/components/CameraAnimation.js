import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const CameraAnimation = {
  init: function () {
    // this.el.setAttribute('camera', 'active', true);

    this.mainCamera = document.querySelector('#camera').object3D;

    this.el.addEventListener('object3dset', (evt) => {
      const scene = this.el.getObject3D('mesh');
      this.cam = scene.children[1].children[0];
    });
  },

  tick: function (time, timeDelta) {
    if (this.cam) {
      this.cam.getWorldPosition(this.mainCamera.position);
      this.cam.getWorldQuaternion(this.mainCamera.quaternion);
    }
  },
};

export default CameraAnimation;
