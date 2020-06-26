import AFRAME from 'aframe';
const THREE = AFRAME.THREE;
import { MeshLine, MeshLineMaterial } from './MeshLine';

const DOWN = new THREE.Vector3(0, -1, 0)
const KNEE_HEIGHT = 10;
const HEAD_HEIGHT = 20;
const NUM_LEGS = 4;
const BODY_SEGMENTS = 30;

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
    this.origin = new THREE.Vector3();
  }
  move(timeDelta, time) {
    // first move bottom towards its target
    if (this.target) {
      this.lerpXY(this.legbottom, this.target, timeDelta, true);

      this.initialLegMidOffsetHelper.copy(this.initialLegMidOffset).multiplyScalar(this.height)
      this.initialLegMid2OffsetHelper.copy(this.initialLegMid2Offset).multiplyScalar(this.height)

      this.lerpXY(this.legmid, this.target.clone().add(this.initialLegMidOffsetHelper), timeDelta, false);
      this.lerpXY(this.legmid2, this.target.clone().add(this.initialLegMid2OffsetHelper), timeDelta, false);
      this.geo[this.legmid + 1] = this.yLevel + KNEE_HEIGHT + 0.5 * this.height + 0.5 * Math.sin(time + this.legmid);
      this.geo[this.legmid2 + 1] = this.yLevel + KNEE_HEIGHT + 0.5 * this.height + 0.5 * Math.cos(time + this.legmid);
    }
    return [this.geo[this.legbottom + 0], this.geo[this.legbottom + 1], this.geo[this.legbottom + 2]]
  }
  calculateGroundHeight(pos, raycaster, terrain) {
    this.origin.set(pos.x, 40, pos.z);
    raycaster.set(this.origin, DOWN);

    let intersects = raycaster.intersectObject(terrain);
    if (intersects[0]) {
      return intersects[0].point.y;
    }

    return pos.y;
  }
  setTarget(target, terrain, raycaster) {
    this.target = new THREE.Vector3().addVectors(target, this.initalOffset.clone().multiplyScalar(2 + 1 * Math.random(1)));
    this.yLevel = 0;
    if (terrain) {
      this.yLevel = this.calculateGroundHeight(this.target, raycaster, terrain);
    }
    this.curLength = this.getDist(this.legbottom, this.target)[0];
    this.isDone = false;
  }
  lerpXY(idx, target, t, shouldSetDone) {
    let res = this.getDist(idx, target);
    if (shouldSetDone) this.isDone = true;
    if (res[0] > 0.01) {
      if (shouldSetDone) {
        this.height = KNEE_HEIGHT * Math.sin(Math.PI * res[0] / this.curLength)
        this.geo[idx + 1] = this.height + this.yLevel;
        this.isDone = false;
      }
      this.geo[idx + 0] += Math.sign(res[1]) * Math.min(t, Math.abs(res[1]));
      this.geo[idx + 2] += Math.sign(res[2]) * Math.min(t, Math.abs(res[2]));
    }
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

    let geo = new Float32Array(NUM_LEGS * 4 * 3 + 1*3 + BODY_SEGMENTS * 3)
    geo[0] = 0;
    geo[1] = HEAD_HEIGHT;
    geo[2] = 0;
    let starting = NUM_LEGS * 4 * 3 + 1*3;
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
      for(let m = 0; m < 3; m++)
      {
        let b = Math.floor(Math.random() * BODY_SEGMENTS);
        if(takenVerts.includes(b+1)) continue;
        if(takenVerts.includes(b-1)) continue;
        takenVerts.push(b)
        this.mirrorVerts.push([legIdx + 3, starting + b * 3])
        geo[starting + b * 3 + 0] = geo[legIdx + 3 + 0]
        geo[starting + b * 3 + 1] = geo[legIdx + 3 + 1]
        geo[starting + b * 3 + 2] =  geo[legIdx + 3 + 2]
      }
    }
    this.body = []
    for(let i = 0 ; i < BODY_SEGMENTS; i ++)
    {
      if(takenVerts.includes(i))
      {
        continue;
      }
      this.body.push(starting + i * 3)
      geo[starting + i * 3 + 0] = 0 + 1* (Math.random()-0.5) + 2 * Math.cos(2*i);
      geo[starting + i * 3 + 1] = 20 + 5*(Math.random()-0.5); 
      geo[starting + i * 3 + 2] =  0 + 1* (Math.random()-0.5) + 2 * Math.sin(2*i);
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

    // wait for mesh to load
    ground.addEventListener('object3dset', (event) => {
      const group = event.target.object3D;
      const groundMesh = group.getObjectByProperty('type', 'Mesh');
      this.terrain = groundMesh;
    });

    this.key = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({color:0}));
    this.el.sceneEl.object3D.add(this.key)
  },

  tick: function (time, timeDelta) {
    let averagedPos = new THREE.Vector3();
    this.legs.forEach((leg, idx) => {
      var pos = leg.move(timeDelta / 300, time / 300)
      averagedPos.x += pos[0]
      averagedPos.y += pos[1]
      averagedPos.z += pos[2]
    })

    averagedPos.multiplyScalar(1 / this.legs.length);
    averagedPos.y += 2 * Math.sin(time / 300);

    this.body.forEach((idx) => {
      this.mesh.geo[idx] = this.initalGeo[idx] + averagedPos.x;
      this.mesh.geo[idx + 1] = this.initalGeo[idx + 1] + averagedPos.y;
      this.mesh.geo[idx + 2] = this.initalGeo[idx + 2] + averagedPos.z;
    })
    this.key.position.set(averagedPos.x, HEAD_HEIGHT + averagedPos.y, averagedPos.z);
    this.mirrorVerts.forEach(([idx1, idx2]) => {
      this.mesh.geo[idx2] = this.mesh.geo[idx1];
      this.mesh.geo[idx2 + 1] = this.mesh.geo[idx1 + 1];
      this.mesh.geo[idx2 + 2] = this.mesh.geo[idx1 + 2];
    })

    if (this.legs[this.curIdx].isDone) {
      this.curIdx = (this.curIdx + 1) % this.legs.length
      this.curPathPoint.x += 1;
      this.legs[this.curIdx].setTarget(this.curPathPoint, this.terrain, this.raycaster)
    }
    this.mesh.line.setGeometry(this.mesh.geo, function( p ) { 
      return (p < 4*NUM_LEGS/(4*NUM_LEGS + BODY_SEGMENTS))? 1 : 1.4;
      })
  },
};
