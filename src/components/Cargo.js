import AFRAME from 'aframe';
import CargoMaterial from './CargoMaterial'
const THREE = AFRAME.THREE;

//CONFIG
const PATH_DIVISIONS = 200;
const NUM_CARGO = 40;
const SPACING = PATH_DIVISIONS / NUM_CARGO;
const CARGO_SPEED = .001;
const CARGO_ROT_SPEED = .0005;
const UP_VEC = new THREE.Vector3(0, 1, 0);

const Cargo = {
  schema: {
    character: { type: 'model' },
    pathJson: { type: 'model' }
  },

  init: function() {
    // private members
    this.cargoPath = []
    this.cargoRots = []

    const promiseOfModel = new Promise((resolve, reject) => {
      new THREE.FBXLoader().load(this.data.character, (model) => {
        resolve(model);
      }, console.log, console.log);
    });
    const promiseOfPath = new Promise((resolve, reject) => {
      new THREE.FileLoader().load(this.data.pathJson, (json) => {
        let jParsed = JSON.parse(json);
        let pathTuples = jParsed[15][1][0][1][7][5];
        resolve(pathTuples);
      });
    });
    const promiseOfTerrain = new Promise((resolve, reject) => {
      const ground = document.querySelector("#ground");
      ground.addEventListener('object3dset', (event) => {
        const terrain = event.target.object3D.getObjectByProperty('type', 'Mesh');
        resolve(terrain);
      });
    });

    const promiseOfWireOrigin = new Promise((resolve, reject) => {
      const origin = document.querySelector("#origin1");
      origin.addEventListener('object3dset', (event) => {
        resolve(origin.components["julia-material"]);
      });
    });

    this.initialized = false;
    Promise.all([promiseOfPath, promiseOfTerrain, promiseOfModel, promiseOfWireOrigin]).then((values) => {
      this.initPath(values[0], values[1])
      this.onModelLoad(values[2])
      this.originMat = values[3]
      this.initialized = true;
    });
  },

  initPath: function (pathTuples, terrain) {
    let pathVector3 = pathTuples.map(tuple => {
      let vec = new THREE.Vector3(tuple[0], 0, tuple[2]);
      return vec;
    });
    this.cargoPath = new THREE.CatmullRomCurve3(pathVector3).getPoints(PATH_DIVISIONS);
    //derive path rotations
    let tempRot = new THREE.Matrix4();
    let tempEye = new THREE.Vector3()
    let tempTarget = new THREE.Vector3();
    for (let i = 0; i < this.cargoPath.length - 1; i++) {
      tempEye.set(this.cargoPath[i].x, 0, this.cargoPath[i].z);
      tempTarget.set(this.cargoPath[i + 1].x, 0, this.cargoPath[i + 1].z);
      tempRot.lookAt(tempTarget, tempEye, UP_VEC);
      let targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(tempRot);
      this.cargoRots.push(targetQuaternion);
    }
    this.initializeCargoPathYHeight(terrain);
  },
  initializeCargoPathYHeight: function (terrain) {
    let origin = new THREE.Vector3();
    let raycaster = new THREE.Raycaster();
    let down = new THREE.Vector3(0, -1, 0);
    for (let i = 0; i < this.cargoPath.length - 1; i++) {
      origin.set(this.cargoPath[i].x, 40, this.cargoPath[i].z);
      raycaster.set(origin, down);
      let intersects = raycaster.intersectObject(terrain);
      if (intersects[0]) {
        this.cargoPath[i].y = intersects[0].point.y;
      }
    }
  },
  onModelLoad: function (fbx) {
    let loadedObject = fbx;
    let walkAnimation = loadedObject.animations[0];
    // Only cloning this so it doesnt clash with the other non-shared skeleton mode
    // Setting objects that are all used by the shared skeleton models
    this.sharedMainModel = loadedObject.getObjectByName('unamed');
    const sharedParentBone = loadedObject.getObjectByName('mixamorig_Hips');

    this.sharedMixer = new THREE.AnimationMixer(loadedObject);
    this.sharedSkeleton = this.sharedMainModel.skeleton;
    let sharedWalkAnimation = this.sharedMixer.clipAction(walkAnimation);
    sharedWalkAnimation.play();
    
    // // The bones need to be in the scene for the animation to work
    this.el.object3D.add(sharedParentBone);
    this.initializeCharacters();
  },
  initializeCharacters: function () {
    this.cargos = []
    for (let i = 0; i < NUM_CARGO; i++) {
      const cargo = this.sharedMainModel.clone();
      cargo.material = new CargoMaterial({ color: new THREE.Color(0, 0, 0), skinning: true });
      cargo.bind(this.sharedSkeleton, cargo.matrixWorld);
      cargo.bindMode = 'detached';
      let point = this.cargoPath[i * SPACING];
      cargo.position.x = point.x;
      cargo.position.z = point.z;
      cargo.position.y = 1;
      cargo.scale.set(1.5, 1.5, 1.5);
      this.el.object3D.add(cargo);
      this.cargos.push(cargo)
      cargo.idx = i * SPACING;
      cargo.transitionIdx = 0;
    }
  },
  tick: function (time, timeDelta) {
    if(!this.initialized) return;

    let timeDeltaSec = timeDelta / 1000.0;
    this.sharedMixer.update(timeDeltaSec);
    // move all entities along their path 
    for (let i = 0; i < this.cargos.length; i++) {
      let cargo = this.cargos[i];
      cargo.idx += CARGO_SPEED * timeDelta;
      if (cargo.idx >= PATH_DIVISIONS - 1) {
        cargo.idx = 0;
      }
      if(this.originMat && cargo.idx > 10 && cargo.idx < 13)
      {
        this.originMat.cargoToFollow = cargo;
      }

      let k = Math.floor(cargo.idx);
      let m = cargo.idx - k;
      cargo.position.z = (1 - m) * this.cargoPath[k].z + m * this.cargoPath[k + 1].z;
      cargo.position.x = (1 - m) * this.cargoPath[k].x + m * this.cargoPath[k + 1].x;
      cargo.position.y = (1 - m) * this.cargoPath[k].y + m * this.cargoPath[k + 1].y;
      cargo.quaternion.rotateTowards(this.cargoRots[k + 1], CARGO_ROT_SPEED * timeDelta);
    }
  }
}

export default Cargo;
