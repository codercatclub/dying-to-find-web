import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

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
  },

  activate: function () {
    this.isActive = true;
  },

  tick: function (time, timeDelta) {
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
        this.moverComponent.Teleport(new THREE.Vector3());
        setTimeout(()=>{
          this.voidScene.setAttribute("visible", "true");
        },2000);
        break;
      }
    }
  },
};

export default Shrine;
