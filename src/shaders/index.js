import MagneticFieldVert from './MagneticFieldVert.glsl';
import MagneticFieldFrag from './MagneticFieldFrag.glsl';

import JuliaVert from './JuliaVert.glsl';
import JuliaFrag from './JuliaFrag.glsl';

const MagneticField = {
  schema: {
    timeMsec: { type: 'time', is: 'uniform' },
    shockMag: { type: 'float', is: 'uniform', default: 1 },
    shockFreq: { type: 'float', is: 'uniform', default: 10 },
    pulseSpread: { type: 'float', is: 'uniform', default: 2 },
    packetLength: { type: 'float', is: 'uniform', default: 0.001 },
    trailLength: { type: 'float', is: 'uniform', default: 0.49 },
  },
  vertexShader: MagneticFieldVert,
  fragmentShader: MagneticFieldFrag,
};

const Julia = {
  schema: {
    timeMsec: { type: 'time', is: 'uniform' },
    playerPos1: { type: 'vec4', is: 'uniform', default: new THREE.Vector4(1000,1000,1000,1) },
    playerPos2: { type: 'vec4', is: 'uniform', default: new THREE.Vector4(1000,1000,1000,1), },
  },
  vertexShader: JuliaVert,
  fragmentShader: JuliaFrag,
};

export { Julia, MagneticField };
