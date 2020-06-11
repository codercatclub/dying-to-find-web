const THREE = AFRAME.THREE;
import CCBasicVert from '../shaders/CCBasicVert.glsl';
import CCBasicFrag from '../shaders/CCBasicFrag.glsl';

export default class CargoMaterial extends THREE.MeshBasicMaterial {
  constructor(uniforms){
    super(uniforms);
    this.onBeforeCompile = (shader) => {
      shader.uniforms.stretchAmt = { value: 0 };
      shader.vertexShader = CCBasicVert;
      shader.fragmentShader = CCBasicFrag;
      this.shader = shader;
    }
  }
}
