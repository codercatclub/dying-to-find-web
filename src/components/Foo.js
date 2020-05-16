import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const Foo = {
  schema: {
    color: { default: new THREE.Color() },
  },

  init: function () {
    console.log('[D] this.data: ', this.data);
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  },
}

export default Foo;
