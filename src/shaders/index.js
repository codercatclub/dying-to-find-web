import FresnelVert from './FresnelVert.glsl';
import FresnelFrag from './FresnelFrag.glsl';

export const Fresnel = {
  schema: {
    color: { type: 'color', is: 'uniform', default: 'red' },
    opacity: { type: 'number', is: 'uniform', default: 1.0 },
  },
  vertexShader: FresnelVert,
  fragmentShader: FresnelFrag,
}
