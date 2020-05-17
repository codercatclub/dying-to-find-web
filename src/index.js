import AFRAME from 'aframe';
require('aframe-gltf-part-component');
require('aframe-extras');
import Foo from './components/Foo';
import DynamicComponents from './systems/DynamicComponents';
import { Fresnel } from './shaders';

const THREE = AFRAME.THREE;

// Register all shaders
AFRAME.registerShader('fresnel', Fresnel);

// Register all systems
// AFRAME.registerSystem('dynamic-components', DynamicComponents);

// Register all components
AFRAME.registerComponent('foo', Foo);
