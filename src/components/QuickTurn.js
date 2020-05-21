import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

// quest only
const QuickTurn = {
  schema: {},

  init: function () {
    this.isVR = false;
    this.allowedToQuickturn = false;
    this.quickTurnTarget = 0;
    this.lastAxis = new THREE.Vector2();
    this.vrMovingSpeed = 0.0039;
    this.cam = this.el.object3D;

    this.el.sceneEl.addEventListener('enter-vr', () => {
      this.isVR = true;
    });

    const camera = document.querySelector('#camera');
    this.camera = camera.object3D;

    /*
      Oculus touch controller events
    */
    this.el.addEventListener('thumbsticktouchstart', (evt) => {
      this.allowedToQuickturn = true;
    });

    this.el.addEventListener('axismove', (evt) => {
      this.lastAxis.x = evt.detail.axis[2];
      this.lastAxis.y = evt.detail.axis[3];

      if (Math.abs(this.lastAxis.x) < 0.2) {
        this.allowedToQuickturn = true;
      }

      if (!this.allowedToQuickturn) {
        return;
      }

      if (this.lastAxis.x > 0.7) {
        this.quickTurnTarget -= 45;
        this.allowedToQuickturn = false;

      } else if (this.lastAxis.x < -0.7) {
        this.quickTurnTarget += 45;
        this.allowedToQuickturn = false;
      }
    });
  },

  tick: function (time, timeDelta) {
    if (this.isVR) {
      this.cam.rotation.y = this.quickTurnTarget;
    }
  },
};

export default QuickTurn;
