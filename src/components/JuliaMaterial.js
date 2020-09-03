import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

import JuliaVert from '../shaders/JuliaVert.glsl';
import JuliaFrag from '../shaders/JuliaFrag.glsl';

const JuliaMaterialComponent = {
  schema: {
    timeMsec: { default: 1 },
    playerPos1: { type: "vec4", default: new THREE.Vector4(1000,1000,1000,1) },
    playerPos2: { type: "vec4", default: new THREE.Vector4(1000,1000,1000,1) },
    viewDirMag: { default: 1 },
    blackOut: { default: 0 },
  },

  init: function () {
    this.uniforms = this.initVariables(this.data);
    this.juliaMaterial = new THREE.MeshBasicMaterial({
      side : THREE.DoubleSide,
    });
    
    this.juliaMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = THREE.UniformsUtils.merge([this.uniforms, shader.uniforms]);
      shader.vertexShader = JuliaVert;
      shader.fragmentShader = JuliaFrag;
      this.materialShader = shader;
    };

    this.el.addEventListener('object3dset', () => {
      this.mesh = this.el.object3D.getObjectByProperty('type', 'Mesh');
      this.mesh.material = this.juliaMaterial;
    });

    const camera = document.querySelector("#camera");
    this.camera = camera.object3D;
    this.cameraWorldPosition = new THREE.Vector3();
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
      this.camera.getWorldPosition(this.cameraWorldPosition);
      if(this.cargoToFollow)
      {
        this.materialShader.uniforms.playerPos1.value = new THREE.Vector4(this.cargoToFollow.position.x + 0.5*Math.sin(0.001*time), this.cargoToFollow.position.y+2, this.cargoToFollow.position.z+ 0.5*Math.cos(0.001*time), 0.2);
      }
      this.materialShader.uniforms.playerPos2.value = new THREE.Vector4(this.cameraWorldPosition.x, this.cameraWorldPosition.y, this.cameraWorldPosition.z, 1/(10 * 10));
    }
  },
};

class JuliaMaterial extends THREE.MeshBasicMaterial {
  constructor(){
    super();
    this.onBeforeCompile = (shader) => {
      shader.uniforms["timeMsec"] = {value: 0}
      shader.uniforms.cutOff= { value: 0 }
      shader.uniforms.playerPos1= { value: new THREE.Vector4(1000,1000,1000,1) }
      shader.uniforms.playerPos2= { value: new THREE.Vector4(1000,1000,1000,1) }
      shader.vertexShader = JuliaVert;
      shader.fragmentShader = JuliaFrag;
      this.shader = shader;
    }
  }
}

export {JuliaMaterialComponent, JuliaMaterial}
