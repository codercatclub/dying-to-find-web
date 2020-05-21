import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const GLTFCamera = {
  init: function () {
    const mainCamEl = document.createElement('a-entity');
    this.el.sceneEl.appendChild(mainCamEl);

    this.mainCameraContainer = mainCamEl.object3D;

    this.el.addEventListener('object3dset', (evt) => {
      mainCamEl.setAttribute('camera', 'active', true);
      const scene = this.el.getObject3D('mesh');
      this.cam = scene.getObjectByProperty('type', 'PerspectiveCamera');
      this.mainCam = this.mainCameraContainer.getObjectByProperty(
        'type',
        'PerspectiveCamera',
      );
    });
  },

  tick: function (time, timeDelta) {
    if (this.cam) {
      this.cam.getWorldPosition(this.mainCameraContainer.position);
      this.cam.getWorldQuaternion(this.mainCameraContainer.quaternion);
      this.mainCam.fov = this.cam.fov;
      this.mainCam.updateProjectionMatrix();
    }
  },
};

export default GLTFCamera;
