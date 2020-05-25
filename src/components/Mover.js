import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const Mover = {
  schema: {
    groundID: { type: 'string', default: 'ground' },
    controllerID: { type: 'string', default: 'rightHandContloller' },
    cameraID: { type: 'string', default: 'camera' },
    cameraRigID: { type: 'string', default: 'cameraRig' },
  },

  init: function () {
    const { groundID, cameraRigID, controllerID, cameraID } = this.data;

    this.lastAxis = new THREE.Vector2();
    this.vrMovingSpeed = 0.0039;

    const cameraRigEl = document.querySelector(`#${cameraRigID}`);
    this.cameraRig = cameraRigEl.object3D;

    const controller = document.querySelector(`#${controllerID}`);

    const camera = document.querySelector(`#${cameraID}`);
    this.camera = camera.object3D;

    // ground raycasting
    this.raycaster = new THREE.Raycaster();
    const ground = document.querySelector(`#${groundID}`);

    // wait for mesh to load
    ground.addEventListener('object3dset', (event) => {
      const group = event.target.object3D;
      const groundMesh = group.getObjectByProperty('type', 'Mesh');

      this.terrain = groundMesh;
    });

    this.down = new THREE.Vector3(0, -1, 0);
    this.origin = new THREE.Vector3();
    this.worldQuat = new THREE.Quaternion();

    /*
      Oculus remote controller events
    */
    controller.addEventListener('axismove', (evt) => {
      this.lastAxis.x = evt.detail.axis[2];
      this.lastAxis.y = evt.detail.axis[3];
    });
  },

  tick: function (time, timeDelta) {
    this.camera.getWorldQuaternion(this.worldQuat);

    const tweenForward = new THREE.Vector3(
      -this.lastAxis.x,
      0,
      -this.lastAxis.y,
    ).applyQuaternion(this.worldQuat.premultiply(this.camera.quaternion));

    this.handleMove(tweenForward, timeDelta);
  },

  handleMove: function (move, timeDelta) {
    this.cameraRig.position.sub(
      move.multiplyScalar(this.vrMovingSpeed * timeDelta),
    );

    if (this.terrain) {
      const groundHeight = this.calculateGroundHeight(this.cameraRig.position);

      this.cameraRig.position.y = this.calculateGroundHeight(
        this.cameraRig.position,
      );
    }
  },

  calculateGroundHeight: function (pos) {
    this.origin.set(pos.x, 40, pos.z);
    this.raycaster.set(this.origin, this.down);

    var intersects = this.raycaster.intersectObject(this.terrain);
    if (intersects[0]) {
      return intersects[0].point.y + 1;
    }

    return pos.y;
  },
};

export default Mover;
