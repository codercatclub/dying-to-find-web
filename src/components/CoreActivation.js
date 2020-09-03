import AFRAME from "aframe";
const THREE = AFRAME.THREE;

const CoreActivation = {
  schema: {
    coreId: { type: "string" },
    wireId: { type: "string" },
  },

  init: function () {
    const core = document.querySelector(`${this.data.coreId}`);
    core.addEventListener("object3dset", (event) => {
      const mesh = event.target.object3D.getObjectByProperty("type", "Mesh");
      this.triggerPoint = new THREE.Vector3();
      mesh.getWorldPosition(this.triggerPoint);
      this.coreMesh = mesh;
    });

    const wire = document.querySelector(`${this.data.wireId}`);
    wire.addEventListener("object3dset", (event) => {
      this.wireMeshMaterial = wire.components["power-wire-material"];
    });

    const camera = document.querySelector("#camera");
    this.camera = camera.object3D;
    this.cameraWorldPos = new THREE.Vector3();

    this.activated = false;
  },

  tick: function (time, timeDelta) {
    if (!(this.wireMeshMaterial && this.coreMesh) || this.activated) return;
    this.camera.getWorldPosition(this.cameraWorldPos);
    let dist = this.cameraWorldPos.distanceTo(this.triggerPoint);
    if (dist < 5) {
      this.activated = true;
      //start activation routine
      this.wireMeshMaterial.activate();
      this.coreMesh.material.uniforms["viewDirMag"].value = 0;
    }
  },
};

export default CoreActivation;
