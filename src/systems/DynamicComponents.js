import AFRAME from 'aframe';

const THREE = AFRAME.THREE;

const DynamicComponents = {
  init: function () {
    const scene = this.el.sceneEl;
    const components = [
      [
        ['gltf-part', { src: '#pig', part: 'pig' }],
        ['position', new THREE.Vector3(0, 2, -3)],
        ['foo', { color: new THREE.Color(0xff0000) }],
      ],
      [
        ['gltf-part', { src: '#pig', part: 'pig' }],
        ['position', new THREE.Vector3(2, 2, -3)],
        ['foo', { color: new THREE.Color(0xff0000) }],
      ],
      [
        ['gltf-part', { src: '#pig', part: 'toy' }],
        ['position', new THREE.Vector3(-2, 0, -3)],
        ['material', { shader: 'fresnel', color: '#5485ff' }],
      ],
    ];

    components.forEach((attrs) => {
      const entity = document.createElement('a-entity');
      attrs.forEach((attr) => {
        entity.setAttribute(attr[0], attr[1]);
      });
      scene.appendChild(entity);
    });
  },
}

export default DynamicComponents;
