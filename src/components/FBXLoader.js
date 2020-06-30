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
    }).catch(console.log);

  }
};
