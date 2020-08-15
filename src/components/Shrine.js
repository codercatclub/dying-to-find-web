import AFRAME from 'aframe';
const THREE = AFRAME.THREE;
import JuliaFrag from '../shaders/JuliaFrag.glsl';
import JuliaVert from '../shaders/JuliaPlaneVert.glsl';

const Shrine = {
  schema: {
  },

  init: function () {
    this.entranceWorldPos = new THREE.Vector3();
    this.cameraWorldPos = new THREE.Vector3();

    const camera = document.querySelector("#camera");
    this.camera = camera.object3D;

    this.entrances = document.querySelectorAll(".entrance");

    this.cityScene = document.querySelector("#city-scene");
    this.voidScene = document.querySelector("#void-scene");
    

    this.isActive = false;

    this.shrineMat = new THREE.ShaderMaterial({
      uniforms: {
        timeMsec: { value: 0.0 },
        viewDirMag: { value: 0.0 },
      },
      vertexShader: JuliaVert,
      fragmentShader: JuliaFrag,
      side: THREE.DoubleSide
    });

    this.el.addEventListener('object3dset', () => {
      this.shrineDoors = []
      // Assign material to all child meshes
      event.target.object3D.traverse(child => {
        if (child.type === 'Mesh') {
          this.shrineDoors.push(child);
          child.material = this.shrineMat;
        }
      });
    });

  },

  activate: function () {
    this.isActive = true;
    this.shrineDoors.forEach(door => {
      door.material = this.shrineMat;
    });
  },

  tick: function (time, timeDelta) {
    this.shrineMat.uniforms.timeMsec.value = time;
    if(!this.moverComponent)
    {
      this.moverComponent = document.querySelector('#camera').components.mover;
    }
    if(!this.isActive) return;
    this.camera.getWorldPosition(this.cameraWorldPos);
    this.cameraWorldPos.y = 0;
    for(let i = 0; i < this.entrances.length; i++) {
      this.entrances[i].object3D.getWorldPosition(this.entranceWorldPos);
      this.entranceWorldPos.y = 0;
      let dist = this.cameraWorldPos.distanceTo(this.entranceWorldPos);
      if(dist < 1)
      {
        this.cityScene.setAttribute("visible", "false");
        document.querySelector('#background-sound').components["sound"].stopSound()
        this.moverComponent.Teleport(new THREE.Vector3());
        setTimeout(()=>{
          this.voidScene.setAttribute("visible", "true");
          document.querySelector('#void-scene-sound').components["sound"].playSound()
        },2000);
        break;
      }
    }
  },
};

export default Shrine;
