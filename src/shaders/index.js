import FresnelVert from './FresnelVert.glsl';
import FresnelFrag from './FresnelFrag.glsl';

export const Fresnel = {
  schema: {
    color: { type: 'color', is: 'uniform', default: 'red' },
    timeMsec: { type: 'time', is: 'uniform' },
    displacementScale: { type: 'float', is: 'uniform', default: 0.01 },
  },
  vertexShader: FresnelVert,
  fragmentShader: FresnelFrag,
};
