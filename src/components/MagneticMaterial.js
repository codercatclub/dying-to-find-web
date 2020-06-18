import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

import MagneticFieldVert from '../shaders/MagneticFieldVert.glsl';
import MagneticFieldFrag from '../shaders/MagneticFieldFrag.glsl';

export default {
  schema: {
    timeMsec: { default: 1 },
    shockMag: { default: 1 },
    shockFreq: { default: 10 },
    pulseSpread: { default: 2 },
    packetLength: { default: 0.001 },
    trailLength: { default: 0.49 },
  },

  init: function () {
    this.uniforms = this.initVariables(this.data);
    this.magneticMaterial = new THREE.MeshBasicMaterial(this.uniforms);
    this.magneticMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = THREE.UniformsUtils.merge([this.uniforms, shader.uniforms]);
      shader.vertexShader = MagneticFieldVert;
      shader.fragmentShader = MagneticFieldFrag;
      this.materialShader = shader;
    };
    this.el.addEventListener('object3dset', () => {
      const mesh = this.el.object3D.getObjectByProperty('type', 'Mesh');
      mesh.material = this.magneticMaterial;
    });
  },

  initVariables: function (data, type) {
    let key;
    let variables = {};
    for (key in data) {
      variables[key] = {
        value: data[key],
      };
    }
    return variables;
  },

  update: function (data) {
    if (!this.materialShader) {
      return;
    }

    let key;
    for (key in data) {
      this.materialShader.uniforms[key].value = data[key];
      this.materialShader.uniforms[key].needsUpdate = true;
    }
  },

  tick: function (time, timeDelta) {
    if (this.materialShader) {
      this.materialShader.uniforms.timeMsec.value = time;
    }
  },
};
