import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

import CharacterVert from '../shaders/CharacterVert.glsl';
import CharacterFrag from '../shaders/CharacterFrag.glsl';

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
    this.magneticMaterial = new THREE.MeshBasicMaterial({
      side : THREE.DoubleSide,
    });
    this.magneticMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = THREE.UniformsUtils.merge([this.uniforms, shader.uniforms]);
      shader.vertexShader = CharacterVert;
      shader.fragmentShader = CharacterFrag;
      this.materialShader = shader;
    };
    // this.el.addEventListener('object3dset', () => {
      this.mesh = this.el.object3D.getObjectByProperty('type', 'Mesh');
      this.mesh.material = this.magneticMaterial;
      this.mesh.geometry = new THREE.PlaneBufferGeometry(1,1,100,100);
    // });
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
    if (!this.magneticMaterial.materialShader) {
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
    //this.mesh.position.x -= 0.0001 * timeDelta;
    // this.mesh.rotateZ(0.001*timeDelta)
    // this.mesh.lookAt(2*Math.sin((time+100.0)*0.001), 2*Math.cos((time+100.0)*0.001), Math.cos((time+100.0)*0.001))
  },
};
