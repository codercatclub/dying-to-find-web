import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

import CCBasicVert from '../shaders/CCBasicVert.glsl';
import CCBasicFrag from '../shaders/CCBasicFrag.glsl';

export default {
  schema: {
    timeMsec: { default: 1 },
    color: { type: 'color', default: "#ffffff" },
    vertexColors: { type: 'string', default: '' }
  },

  init: function () {
    const { vertexColors, color } = this.data;
    this.uniforms = this.initVariables(this.data);

    const materialOptions = {
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
    }

    switch (vertexColors) {
      case '':
        break;

      case 'vertex':
        materialOptions.vertexColors = THREE.VertexColors;
        break;

      case 'face':
        materialOptions.vertexColors = THREE.FaceColors;
        break;
    
      default:
        console.log('Unknown value for vertexColor parameter. Accepted values are "vertex" or "face".');
        break;
    }

    this.basicMat = new THREE.MeshBasicMaterial(materialOptions);

    this.basicMat.onBeforeCompile = (shader) => {
      shader.uniforms = THREE.UniformsUtils.merge([this.uniforms, shader.uniforms]);
      shader.vertexShader = CCBasicVert;
      shader.fragmentShader = CCBasicFrag;
      this.materialShader = shader;
    };

    this.el.addEventListener('object3dset', () => {
      // Assign material to all child meshes
      this.el.object3D.traverse(child => {
        if (child.type === 'Mesh') {
          child.material = this.basicMat;
        }
      });
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
