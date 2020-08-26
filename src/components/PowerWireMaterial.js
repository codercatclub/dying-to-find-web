import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

import PowerWireVert from '../shaders/PowerWireVert.glsl';
import PowerWireFrag from '../shaders/PowerWireFrag.glsl';

export default {
  schema: {
    timeMsec: { default: 1 },
  },

  init: function () {
    this.uniforms = this.initVariables(this.data);
    this.powerWireMaterial = new THREE.MeshBasicMaterial(this.uniforms);
    this.powerWireMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = THREE.UniformsUtils.merge([this.uniforms, shader.uniforms]);
      shader.vertexShader = PowerWireVert;
      shader.fragmentShader = PowerWireFrag;
      this.materialShader = shader;
    };
    this.el.addEventListener('object3dset', () => {
      const mesh = this.el.object3D.getObjectByProperty('type', 'Mesh');
      mesh.material = this.powerWireMaterial;
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
