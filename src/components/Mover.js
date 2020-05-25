import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const Mover = {
  schema: {},

  init: function () {
    this.pressed = false;
    this.pressedQuest = false;
    this.lastAxis = new THREE.Vector2();
    this.vrMovingSpeed = 0.0039;

    const camera = document.querySelector('#camera');
    this.camera = camera.object3D;

    // ground raycasting
    this.raycaster = new THREE.Raycaster();
    // TODO: Pass id through schema
    const ground = document.querySelector('#ground');

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
    this.el.addEventListener('trackpaddown', () => {
      this.pressed = true;
    });

    this.el.addEventListener('trackpadup', () => {
      this.pressed = false;
    });

    this.el.addEventListener('axismove', (evt) => {
      this.lastAxis.x = evt.detail.axis[2];
      this.lastAxis.y = evt.detail.axis[3];
    });

    /*
      Oculus touch controller events
    */
    this.el.addEventListener('thumbsticktouchstart', (evt) => {
      this.pressedQuest = true;
    });
    this.el.addEventListener('thumbsticktouchend', (evt) => {
      this.pressedQuest = false;
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
    this.camera.position.sub(
      move.multiplyScalar(this.vrMovingSpeed * timeDelta),
    );
    if (this.terrain) {
      const groundHeight = this.calculateGroundHeight(this.camera.position);
      this.camera.position.y = this.calculateGroundHeight(this.camera.position);
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
