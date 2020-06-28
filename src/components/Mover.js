import AFRAME, { utils } from 'aframe';
const THREE = AFRAME.THREE;

import {doRoutine, calculateGroundHeight} from '../Utils'

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
    this.lookControls = camera.components["look-controls"];
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
        this.viewBlocker.material.uniforms.cutOff.value = 1.0-t;
        t += 0.01;
        yield;
      }
      this.viewBlocker.material.uniforms.cutOff.value = 0.0;
      // wait a few seconds
      let d = Date.now();
      while (Date.now() - d < 3000) {
        yield;
      }
      if (this.isVR) {
        this.cameraRig.position.copy(this.lastTelePos);
        this.cameraRig.rotation.y = Math.PI;
      } else {
        this.camera.position.copy(this.lastTelePos);
        this.lookControls.yawObject.rotation.y = Math.PI;
      }
      yield;
      //fade out sphere
      while (t >= 0) {
        this.viewBlocker.scale.set(0.1 * t, 0.1 * t, 0.1 * t);
        this.viewBlocker.material.uniforms.cutOff.value = 1.0-t;
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
      const groundHeight = calculateGroundHeight(this.cameraRig.position, this.raycaster, this.terrain) + 1.8;
      const lerpSpeed = Math.min(0.01 * timeDelta, 1);
      this.cameraRig.position.y = lerpSpeed * groundHeight + (1 - lerpSpeed) * this.cameraRig.position.y;
    }
  },

  handleMove: function (move, timeDelta) {
    if (this.terrain) {
      const groundHeight = calculateGroundHeight(this.camera.position, this.raycaster, this.terrain) + 1.8;
      const lerpSpeed = Math.min(0.01 * timeDelta, 1);
      this.camera.position.y = lerpSpeed * groundHeight + (1 - lerpSpeed) * this.camera.position.y;
    }
  },

  Teleport: function (pos, forward) {
    if (this.teleportRoutine) {
      return;
    }
    this.lastTelePos = pos;
    this.lastTelePos.y = calculateGroundHeight(this.lastTelePos, this.raycaster, this.terrain) + 1.8;
    this.teleportRoutine = this.teleportCoroutine();
  }
};

export default Mover;
