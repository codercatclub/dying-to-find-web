import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

import CCBasicVert from '../shaders/CCBasicVert.glsl';
import CCBasicFrag from '../shaders/CCBasicFrag.glsl';

export default {
  schema: {
    timeMsec: { default: 1 },
    color: {type: 'color', default: "#ffffff"}
  },

  init: function () {
    this.uniforms = this.initVariables(this.data);
    this.basicMat = new THREE.MeshBasicMaterial({
      color : new THREE.Color(this.data.color),
      side : THREE.DoubleSide,
    });
    this.basicMat.onBeforeCompile = (shader) => {
      shader.uniforms = THREE.UniformsUtils.merge([this.uniforms, shader.uniforms]);
      shader.vertexShader = CCBasicVert;
      shader.fragmentShader = CCBasicFrag;
      this.materialShader = shader;
    };
    this.el.addEventListener('object3dset', () => {
      this.mesh = this.el.object3D.getObjectByProperty('type', 'Mesh');
      this.mesh.material = this.basicMat;
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
