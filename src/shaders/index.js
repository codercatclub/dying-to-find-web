import MagneticFieldVert from './MagneticFieldVert.glsl';
import MagneticFieldFrag from './MagneticFieldFrag.glsl';

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

export { MagneticField };
