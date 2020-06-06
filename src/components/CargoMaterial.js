const THREE = AFRAME.THREE;
import CargoMain from '../shaders/CargoMain.glsl';
import CargoUni from '../shaders/CargoUni.glsl';

export default class CargoMaterial extends THREE.MeshBasicMaterial {
  constructor(uniforms){
    super(uniforms);
    this.onBeforeCompile = (shader) => {
      shader.uniforms.stretchAmt = { value: 0 };
      shader.vertexShader = shader.vertexShader.replace(
        '#include <skinning_vertex>', 
        CargoMain 
      )
      shader.vertexShader = shader.vertexShader.replace(
        "#include <logdepthbuf_pars_vertex>", 
        CargoUni 
      )
      this.shader = shader;
    }
  }
}
