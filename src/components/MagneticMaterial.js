import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

import MagneticFieldVert from '../shaders/MagneticFieldVert.glsl';
import MagneticFieldFrag from '../shaders/MagneticFieldFrag.glsl';

class MagneticMaterial extends THREE.MeshBasicMaterial {
  constructor(uniforms) {
    super(uniforms);
    this.onBeforeCompile = (shader) => {
      shader.uniforms = THREE.UniformsUtils.merge([uniforms, shader.uniforms]);
      shader.vertexShader = MagneticFieldVert;
      shader.fragmentShader = MagneticFieldFrag;
      this.materialShader = shader;
    };
  }
}

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
    this.magneticMaterial = new MagneticMaterial(this.uniforms);

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
        value: data[key], // Let updateVariables handle setting these.
      };
    }
    return variables;
  },

  update: function (data) {
    if (!this.magneticMaterial.materialShader) {
      return;
    }

    let key;
    for (key in data) {
      this.magneticMaterial.materialShader.uniforms[key].value = data[key];
      this.magneticMaterial.materialShader.uniforms[key].needsUpdate = true;
    }
  },

  tick: function (time, timeDelta) {
    if (this.magneticMaterial.materialShader) {
      this.magneticMaterial.materialShader.uniforms.timeMsec.value = time;
    }
  },
};
