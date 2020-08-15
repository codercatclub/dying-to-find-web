import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const DOWN = new THREE.Vector3(0, -1, 0);
const ORIGIN = new THREE.Vector3();

const doRoutine = function (coroutine) {
    let r = coroutine.next();
    return r.done;
}

const moveTowardsFlat = function (vec1, vec2, t) {
    let dist = new THREE.Vector3().subVectors(vec2, vec1);
    dist.y = 0;
    if (dist.length() > t) {
        vec1.add(dist.normalize().multiplyScalar(t));
        return true;
    }
    return false
}

const calculateGroundHeight = function(pos, raycaster, terrain) {
    ORIGIN.set(pos.x, 40, pos.z);
    raycaster.set(ORIGIN, DOWN);
    let intersects = raycaster.intersectObject(terrain);
    if (intersects[0]) {
        return intersects[0].point.y;
    }
    return 0;
}

export { doRoutine, moveTowardsFlat, calculateGroundHeight }

