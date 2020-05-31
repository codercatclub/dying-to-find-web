import AFRAME from 'aframe';

import 'aframe-gltf-part-component';
import 'aframe-extras';

import Mover from './components/Mover';
import QuickTurn from './components/QuickTurn';
import MagneticMaterial from './components/MagneticMaterial';
import CharacterMaterial from './components/CharacterMaterial';
import GLTFCamera from './components/GLTFCamera';

import TestSystem from './systems/TestSystem';

import { Fresnel, MagneticField } from './shaders';

const THREE = AFRAME.THREE;

// Register all shaders
AFRAME.registerShader('fresnel', Fresnel);
AFRAME.registerShader('magneticField', MagneticField);

// Register all systems
AFRAME.registerSystem('test-system', TestSystem);

// Register all components
AFRAME.registerComponent('gltf-camera', GLTFCamera);
AFRAME.registerComponent('mover', Mover);
AFRAME.registerComponent('quick-turn', QuickTurn);
AFRAME.registerComponent('magnetic-material', MagneticMaterial);
AFRAME.registerComponent('character-material', CharacterMaterial);
