import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

var doRoutine = function (coroutine) {
  var r = coroutine.next();
  return r.done;
}

const Mover = {
  schema: {
    groundID: { type: 'string', default: 'ground' },
    controllerID: { type: 'string', default: 'rightHandContloller' },
    cameraID: { type: 'string', default: 'camera' },
    cameraRigID: { type: 'string', default: 'cameraRig' },
    speed: { type: 'number', default: 1 },
  },

  init: function () {
    const { groundID, cameraRigID, controllerID, cameraID, speed } = this.data;

    this.isVR = false;
    const scene = this.el.sceneEl;
    this.lastAxis = new THREE.Vector2();
    this.vrMovingSpeed = 0.0039 * speed;

    const cameraRigEl = document.querySelector(`#${cameraRigID}`);
    this.cameraRig = cameraRigEl.object3D;

    const controller = document.querySelector(`#${controllerID}`);

    const camera = document.querySelector(`#${cameraID}`);
    this.wasdControls = camera.getAttribute('wasd-controls')
    this.camera = camera.object3D;

    this.viewBlocker = document.querySelector(`#viewBlocker`).object3D.getObjectByProperty('type', 'Mesh');
    this.viewBlocker.frustumCulled = false;
    this.viewBlocker.visible = false;
    this.viewBlocker.renderOrder = 100;
    this.viewBlocker.material.depthTest = false;
    this.viewBlocker.material.depthWrite = false;
    

    // ground raycasting
    this.raycaster = new THREE.Raycaster();
    const ground = document.querySelector(`#${groundID}`);

    // wait for mesh to load
    ground.addEventListener('object3dset', (event) => {
      const group = event.target.object3D;
      const groundMesh = group.getObjectByProperty('type', 'Mesh');

      this.terrain = groundMesh;
    });

    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
          this.isVR = true;
        }
      });
    }

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

    this.teleportCoroutine = function* () {
      //fade in sphere
      this.viewBlocker.visible = true;
      let t = 0;
      while (t <= 1) {
        this.viewBlocker.scale.set(0.1 * t, 0.1 * t, 0.1 * t);
        t += 0.01;
        yield;
      }
      t = 1;
      // wait a few seconds
      let d = Date.now();
      while (Date.now() - d < 3000) {
        yield;
      }
      if (this.isVR) {
        this.cameraRig.position.copy(this.lastTelePos);
      } else {
        this.camera.position.copy(this.lastTelePos);
      }
      yield;
      //fade out sphere
      while (t >= 0) {
        this.viewBlocker.scale.set(0.1 * t, 0.1 * t, 0.1 * t);
        t -= 0.01;
        yield;
      }
      this.viewBlocker.visible = false;
    };
  },

  tick: function (time, timeDelta) {
    if(this.teleportRoutine) {
      if(doRoutine(this.teleportRoutine)){
        this.teleportRoutine = null;
      }
      this.wasdControls.enabled = false;
      return;
    }
    this.wasdControls.enabled = true;
    this.camera.getWorldQuaternion(this.worldQuat);
    const tweenForward = new THREE.Vector3(
      -this.lastAxis.x,
      0,
      -this.lastAxis.y,
    ).applyQuaternion(this.worldQuat.premultiply(this.camera.quaternion));

    if (this.isVR) {
      this.handleVRMove(tweenForward, timeDelta);
    } else {
      this.handleMove(tweenForward, timeDelta);
    }
  },

  handleVRMove: function (move, timeDelta) {
    this.cameraRig.position.sub(
      move.multiplyScalar(this.vrMovingSpeed * timeDelta),
    );

    if (this.terrain) {
      const groundHeight = this.calculateGroundHeight(this.cameraRig.position);
      const lerpSpeed = Math.min(0.01 * timeDelta, 1);
      this.cameraRig.position.y = lerpSpeed * groundHeight + (1 - lerpSpeed) * this.cameraRig.position.y;
    }
  },

  handleMove: function (move, timeDelta) {
    if (this.terrain) {
      const groundHeight = this.calculateGroundHeight(this.camera.position);
      const lerpSpeed = Math.min(0.01 * timeDelta, 1);
      this.camera.position.y = lerpSpeed * groundHeight + (1 - lerpSpeed) * this.camera.position.y;
    }
  },
  calculateGroundHeight: function (pos) {
    this.origin.set(pos.x, 40, pos.z);
    this.raycaster.set(this.origin, this.down);

    let intersects = this.raycaster.intersectObject(this.terrain);
    if (intersects[0]) {
      return intersects[0].point.y + 1.8;
    }

    return pos.y;
  },
  Teleport: function (pos) {
    if (this.teleportRoutine) {
      return;
    }
    this.lastTelePos = pos;
    this.teleportRoutine = this.teleportCoroutine();
  }
};

export default Mover;
