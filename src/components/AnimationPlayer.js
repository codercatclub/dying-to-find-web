import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

export default {
  schema: {
    loop: { type: 'int', default: 1 },
  },

  update: function () {
    this.el.addEventListener('object3dset', (event) => {
      if (event.target.object3D.children.length == 0) {
        console.log("[!] FBX with animation player has no children");
        return;
      }
      const model = event.target.object3D.children[0];
      this.mixer = new THREE.AnimationMixer(model);
      this.clips = model.animations;

      if (!this.clips) {
        console.log("[!] FBX object has no animation clips");
        return;
      }

      // Play all clips
      this.clips.forEach((clip) => {
        const action = this.mixer.clipAction(clip);
        action.play();
      });
    });
  },

  resetAll: function() {
    this.clips.forEach((clip) => {
      this.mixer.clipAction(clip).reset();
      this.mixer.clipAction(clip).enabled = false;
    });
  },

  playAll: function() {
    this.clips.forEach((clip) => {
      const { loop } = this.data;
      const action = this.mixer.clipAction(clip);
      
      if (loop === 0) {
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
      }

      action.enabled = true;

      action.play();
    });
  },

  tick: function (time, timeDelta) {
    if (this.mixer) {
      this.mixer.update(timeDelta / 1000);
    }
  }
};
