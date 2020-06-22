import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const loadFBX = (path, onProgress) => new Promise((resolve, reject) => {
  new THREE.FBXLoader().load(path, resolve, onProgress, reject);
});

export default {
  schema: {
    src: { type: 'model' },
  },

  update: function () {
    
    loadFBX(this.data.src).then(model => {
      this.el.setObject3D('mesh', model);

      this.mixer = new THREE.AnimationMixer(model);
      const clips = model.animations;

      // Play all clips
      clips.forEach((clip) => {
        this.mixer.clipAction(clip).play();
      });
    }).catch(console.log);

  },

  tick: function (time, timeDelta) {
    if (this.mixer) {
      this.mixer.update(timeDelta / 1000);
    }
  }
};
