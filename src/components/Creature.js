import AFRAME from 'aframe';
const THREE = AFRAME.THREE;
import { MeshLine, MeshLineMaterial } from './MeshLine';
import { doRoutine, moveTowardsFlat, calculateGroundHeight } from '../Utils'
import {JuliaMaterial} from './JuliaMaterial';

// *** config *** // 
const KNEE_HEIGHT = 10;
const HEAD_HEIGHT = 20;
const NUM_LEGS = 4;
const BODY_SEGMENTS = 30;

const RUNAWAY_THRESH = 8;
const FOLLOW_THRESH = 14;
const PUSHBACK_DIST = 30;
const TARGET_DIST = 10;

const creatureStates = {
  FOLLOW: 'walke',
  IDLE: 'idle',
  JUMP: 'jump',
  RUN: 'run'
}

const temp1 = new THREE.Vector3();
class Leg {
  constructor(geo, idx) {
    this.legmid = 3 * (idx)
    this.legbottom = 3 * (idx + 1)
    this.legmid2 = 3 * (idx + 2)
    this.geo = geo;
    this.isDone = true;
    this.initalOffset = new THREE.Vector3(this.geo[this.legbottom + 0], 0, this.geo[this.legbottom + 2])
    this.initialLegMidOffset = new THREE.Vector3(this.geo[this.legmid + 0], 0, this.geo[this.legmid + 2])
    this.initialLegMidOffsetHelper = this.initialLegMidOffset.clone();
    this.initialLegMid2Offset = new THREE.Vector3(this.geo[this.legmid2 + 0], 0, this.geo[this.legmid2 + 2])
    this.initialLegMid2OffsetHelper = this.initialLegMid2Offset.clone();
    this.lastYLevel = 0.0;
  }
  move(timeDelta, time) {
    // first move bottom towards its target
    if (this.target) {
      let t = timeDelta * this.moveMult;
      this.lastYLevel = this.lerpX(this.lastYLevel, this.yLevel - this.lastYLevel, t)
      this.lerpXY(this.legbottom, this.target, t, true);
      this.initialLegMidOffsetHelper.copy(this.initialLegMidOffset).multiplyScalar(2 * this.height)
      this.initialLegMid2OffsetHelper.copy(this.initialLegMid2Offset).multiplyScalar(2 * this.height)

      this.lerpXY(this.legmid, this.target.clone().add(this.initialLegMidOffsetHelper), t, false);
      this.lerpXY(this.legmid2, this.target.clone().add(this.initialLegMid2OffsetHelper), t, false);
      this.geo[this.legmid + 1] = this.lastYLevel + KNEE_HEIGHT + this.height + this.kneeMult * Math.sin(time + this.legmid);
      this.geo[this.legmid2 + 1] = this.lastYLevel + KNEE_HEIGHT + this.height + this.kneeMult * Math.cos(time + this.legmid);
    }
    return [this.geo[this.legbottom + 0], this.geo[this.legbottom + 1], this.geo[this.legbottom + 2]]
  }
  setTarget(target, terrain, raycaster, moveMult, kneeMult, spreadMult) {
    this.moveMult = moveMult;
    this.kneeMult = kneeMult;
    this.target = new THREE.Vector3().addVectors(target, this.initalOffset.clone().multiplyScalar(spreadMult*2 + 1 * Math.random(1)));
    this.yLevel = 0;
    if (terrain) {
      this.yLevel = calculateGroundHeight(this.target, raycaster, terrain);
    }
    this.curLength = this.getDist(this.legbottom, this.target)[0];
    this.isDone = false;
  }
  lerpXY(idx, target, t, shouldSetDone) {
    let res = this.getDist(idx, target);
    if (shouldSetDone) this.isDone = true;
    if (res[0] > 0.01) {
      if (shouldSetDone) {
        this.height = this.kneeMult * KNEE_HEIGHT * Math.sin(Math.PI * res[0] / this.curLength);
        this.geo[idx + 1] = 2 * this.height + this.lastYLevel;
        this.isDone = false;
      }
      this.geo[idx + 0] = this.lerpX(this.geo[idx + 0], res[1], t)
      this.geo[idx + 2] = this.lerpX(this.geo[idx + 2], res[2], t)
    }
  }
  lerpX(val, dif, t) {
    val += Math.sign(dif) * Math.min(t, Math.abs(dif));
    return val;
  }
  getDist(idx, target) {
    let xDist = target.x - this.geo[idx + 0];
    let zDist = target.z - this.geo[idx + 2];
    let d = Math.sqrt(xDist * xDist + zDist * zDist);
    return [d, xDist, zDist]
  }
}

export default {
  schema: {
  },

  init: function () {
    var line = new MeshLine();

    let geo = new Float32Array(NUM_LEGS * 4 * 3 + 1 * 3 + BODY_SEGMENTS * 3)
    geo[0] = 0;
    geo[1] = HEAD_HEIGHT;
    geo[2] = 0;
    let starting = NUM_LEGS * 4 * 3 + 1 * 3;
    this.mirrorVerts = []
    let takenVerts = []
    for (let i = 0; i < NUM_LEGS; i++) {
      let legIdx = 4 * 3 * i;
      for (let j = -1; j < 2; j++) {
        let legPartIdx = 3 * (j + 2);
        let x = Math.cos((i + 0.2 * j) * 2 * Math.PI / NUM_LEGS)
        let z = Math.sin((i + 0.2 * j) * 2 * Math.PI / NUM_LEGS)
        geo[legIdx + legPartIdx + 0] = x
        geo[legIdx + legPartIdx + 1] = KNEE_HEIGHT * Math.abs(j)
        geo[legIdx + legPartIdx + 2] = z
      }
      geo[legIdx + 3 * 4 + 0] = 0;
      geo[legIdx + 3 * 4 + 1] = HEAD_HEIGHT;
      geo[legIdx + 3 * 4 + 2] = 0;

      //chose two head point to attatch
      for (let m = 0; m < 3; m++) {
        let b = Math.floor(Math.random() * BODY_SEGMENTS);
        if (takenVerts.includes(b + 1)) continue;
        if (takenVerts.includes(b - 1)) continue;
        takenVerts.push(b)
        this.mirrorVerts.push([legIdx + 3, starting + b * 3])
        geo[starting + b * 3 + 0] = geo[legIdx + 3 + 0]
        geo[starting + b * 3 + 1] = geo[legIdx + 3 + 1]
        geo[starting + b * 3 + 2] = geo[legIdx + 3 + 2]
      }
    }
    this.body = []
    for (let i = 0; i < BODY_SEGMENTS; i++) {
      if (takenVerts.includes(i)) {
        continue;
      }
      this.body.push(starting + i * 3)
      geo[starting + i * 3 + 0] = 0 + 1 * (Math.random() - 0.5) + 2 * Math.cos(2 * i);
      geo[starting + i * 3 + 1] = 20 + 5 * (Math.random() - 0.5);
      geo[starting + i * 3 + 2] = 0 + 1 * (Math.random() - 0.5) + 2 * Math.sin(2 * i);
    }
    this.initalGeo = new Float32Array(geo)

    line.setGeometry(geo);
    var material = new MeshLineMaterial({ color: new THREE.Color(0, 0, 0), lineWidth: 0.2 });
    var mesh = new THREE.Mesh(line.geometry, material);
    mesh.frustumCulled = false;
    mesh.geo = geo;
    mesh.line = line;
    this.mesh = mesh;
    this.el.sceneEl.object3D.add(mesh)
    this.legs = []

    for (let i = 0; i < NUM_LEGS; i++) {
      this.legs.push(new Leg(this.mesh.geo, 4 * i + 1))
      this.body.push(4 * 3 * i)
    }
    this.body.push(4 * 3 * NUM_LEGS)
    this.curIdx = 0
    this.curPathPoint = new THREE.Vector3()

    this.raycaster = new THREE.Raycaster();
    const ground = document.querySelector(`#ground`);

    // wait for ground mesh to load
    ground.addEventListener('object3dset', (event) => {
      const group = event.target.object3D;
      const groundMesh = group.getObjectByProperty('type', 'Mesh');
      this.terrain = groundMesh;
    });

    // wait for shrineDock target to load
    const shrineTerminal = document.querySelector(`#shrine-terminal`);
    shrineTerminal.addEventListener('object3dset', (event) => {
      const group = event.target.object3D;
      this.shrineTerminalPosition = group.position.clone();
      this.shrineTerminalPosition.y = 0;
    });

    this.key = new THREE.Mesh(new THREE.SphereGeometry(0.5), new JuliaMaterial());
    this.el.sceneEl.object3D.add(this.key);

    this.creatureState = creatureStates.FOLLOW;
    const camera = document.querySelector("#camera");
    this.camera = camera.object3D;
    this.targetCameraPos = new THREE.Vector3();
    this.targetCameraDir = new THREE.Vector3();
    this.shrineDockTargetPos =
    this.headOffsetAmount = new THREE.Vector3();
  },
  setTargetPosition: function () {
    this.camera.getWorldPosition(this.targetCameraPos);
    this.camera.getWorldDirection(this.targetCameraDir);
    this.targetCameraDir.y = 0;
    this.targetCameraPos.sub(temp1.copy(this.targetCameraDir).multiplyScalar(TARGET_DIST))
    return this.targetCameraPos;
  },
  distToCamera: function () {
    this.camera.getWorldPosition(temp1);
    return temp1.distanceTo(this.curPathPoint);
  },
  handleMovement: function (timeDelta, time) {
    this.setTargetPosition()
    switch (this.creatureState) {
      case creatureStates.FOLLOW: {
        this.headOffsetAmount.y = 2 * Math.sin(time / 300);
        if (this.legs[this.curIdx].isDone) {
          this.curIdx = (this.curIdx + 1) % this.legs.length
          let moved = moveTowardsFlat(this.curPathPoint, this.targetCameraPos, timeDelta / 20);
          let dist = this.distToCamera();
          if (dist < RUNAWAY_THRESH) {
            // later mb this should be a building?
            this.runDirectionTarget = this.targetCameraPos.clone().sub(this.targetCameraDir.multiplyScalar(PUSHBACK_DIST))
            this.creatureState = creatureStates.RUN;
          }
          if (moved) {
            this.legs[this.curIdx].setTarget(this.curPathPoint, this.terrain, this.raycaster, 1, 0.5, 1)
          }
        }
        if (this.shrineTerminalPosition && !this.keyDetached && this.shrineTerminalPosition.distanceTo(this.curPathPoint) < 3) {
          this.creatureState = creatureStates.LOWER;
          this.shrineDockRoutine = this.shrineDockCoroutine();
        }
        break;
      }
      case creatureStates.RUN: {
        this.headOffsetAmount.y = 2 * Math.sin(time / 300);
        if (this.legs[this.curIdx].isDone) {
          this.curIdx = (this.curIdx + 1) % this.legs.length
          let moved = moveTowardsFlat(this.curPathPoint, this.runDirectionTarget, timeDelta / 4);
          let dist = this.distToCamera();
          if (dist > FOLLOW_THRESH && !moved) {
            this.creatureState = creatureStates.FOLLOW;
          }
          if (moved) {
            this.legs[this.curIdx].setTarget(this.curPathPoint, this.terrain, this.raycaster, 10, 0.2, 1)
          }
        }
        break;
      }
      case creatureStates.LOWER: {
        //do nothing here, handled by coroutine
        if (this.shrineDockRoutine) {
          if (doRoutine(this.shrineDockRoutine)) {
            this.shrineDockRoutine = null;
            // this.creatureState = creatureStates.FOLLOW;
          }
        }
        // this.headOffsetAmount -= timeDelta/500;
        break;
      }
    }
  },
  shrineDockCoroutine: function* () {

    //align all 4 feet 
    let counter = 0;
    while(counter < 4)
    {
      if (this.legs[this.curIdx].isDone) {
        this.curIdx = (this.curIdx + 1) % this.legs.length
        this.legs[this.curIdx].setTarget(this.curPathPoint, this.terrain, this.raycaster, 1, 0.1, 2)
        counter++
      }
      yield;
    }

    let target = this.shrineTerminalPosition.clone();
    target.y = 5.1;
    let originalOffset = this.headOffsetAmount.clone();
    let t = 0;
    let targetOffset = new THREE.Vector3().subVectors(target, this.averagedPos);
    while (t <= 1) {
      targetOffset.y = target.y - HEAD_HEIGHT - this.averagedPos.y;
      let e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.headOffsetAmount.lerpVectors(originalOffset, targetOffset, e);
      t += 0.003;
      yield;
    }
    this.headOffsetAmount.lerpVectors(originalOffset, targetOffset, 1);

    // detatch key 
    this.keyDetached = true;
    t = 0;
    originalOffset.copy(this.key.position)
    while (t <= 1) {
      let e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.key.position.lerpVectors(originalOffset, target, e);
      t += 0.01;
      yield;
    }

    t = 0;
    originalOffset.copy(this.headOffsetAmount);
    while (t <= 1) {
      let e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.headOffsetAmount.copy(originalOffset).multiplyScalar(1-e);
      t += 0.01;
      yield;
    }
    this.creatureState = creatureStates.FOLLOW;
  },
  tick: function (time, timeDelta) {
    this.handleMovement(timeDelta, time);
    this.averagedPos = new THREE.Vector3();
    this.legs.forEach((leg, idx) => {
      var pos = leg.move(timeDelta / 300, time / 300)
      this.averagedPos.x += pos[0]
      this.averagedPos.y += pos[1]
      this.averagedPos.z += pos[2]
    })
    this.averagedPos.multiplyScalar(1 / this.legs.length);
    this.body.forEach((idx) => {
      this.mesh.geo[idx] = this.initalGeo[idx] + this.averagedPos.x + this.headOffsetAmount.x;
      this.mesh.geo[idx + 1] = this.initalGeo[idx + 1] + this.averagedPos.y + this.headOffsetAmount.y;
      this.mesh.geo[idx + 2] = this.initalGeo[idx + 2] + this.averagedPos.z + this.headOffsetAmount.z;
    })
    if(!this.keyDetached)
    {
      this.key.position.set(this.averagedPos.x, HEAD_HEIGHT + this.averagedPos.y, this.averagedPos.z).add(this.headOffsetAmount);
    }
    this.mirrorVerts.forEach(([idx1, idx2]) => {
      this.mesh.geo[idx2] = this.mesh.geo[idx1];
      this.mesh.geo[idx2 + 1] = this.mesh.geo[idx1 + 1];
      this.mesh.geo[idx2 + 2] = this.mesh.geo[idx1 + 2];
    })
    this.mesh.line.setGeometry(this.mesh.geo, function (p) {
      return (p < 4 * NUM_LEGS / (4 * NUM_LEGS + BODY_SEGMENTS)) ? 1 : 1.4;
    })
    if(this.key.material.shader)
    {
      this.key.material.shader.uniforms.timeMsec.value += timeDelta;
    }
  },
};
