import AFRAME from 'aframe';

import 'aframe-gltf-part-component';
import 'aframe-extras';

import Mover from './components/Mover';
import QuickTurn from './components/QuickTurn';
import MagneticMaterial from './components/MagneticMaterial';
import CharacterMaterial from './components/CharacterMaterial';
import CCBasicMaterial from './components/CCBasicMaterial';
import {JuliaMaterialComponent} from './components/JuliaMaterial';
import GLTFCamera from './components/GLTFCamera';
import GeoInspector from './components/GeoInspector';
import Creature from './components/Creature';
import WarpPoint from './components/WarpPoint';
import FBXLoader from './components/FBXLoader';
import AnimationPlayer from './components/AnimationPlayer';
import VectorFields from './components/VectorFields';

import TestSystem from './systems/TestSystem';
import SoundSystem from './systems/SoundSystem';
import CargoSystem from './systems/CargoSystem';

import { Julia, MagneticField } from './shaders';

const THREE = AFRAME.THREE;

// Register all shaders
AFRAME.registerShader('magneticField', MagneticField);
AFRAME.registerShader('julia', Julia);

// Register all systems
AFRAME.registerSystem('test-system', TestSystem);
AFRAME.registerSystem('cargo-system', CargoSystem);
AFRAME.registerSystem('sound-system', SoundSystem);

// Register all components
AFRAME.registerComponent('gltf-camera', GLTFCamera);
AFRAME.registerComponent('mover', Mover);
AFRAME.registerComponent('quick-turn', QuickTurn);
AFRAME.registerComponent('geo-inspect', GeoInspector);
AFRAME.registerComponent('creature', Creature);
AFRAME.registerComponent('warp-point', WarpPoint);
AFRAME.registerComponent('ccbasic-material', CCBasicMaterial);
AFRAME.registerComponent('magnetic-material', MagneticMaterial);
AFRAME.registerComponent('character-material', CharacterMaterial);
AFRAME.registerComponent('julia-material', JuliaMaterialComponent);
AFRAME.registerComponent('fbx', FBXLoader);
AFRAME.registerComponent('animation-player', AnimationPlayer);
AFRAME.registerComponent('vector-fields', VectorFields);
