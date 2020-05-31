import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

export default {
  init: function () {
    this.el.addEventListener('object3dset', (evt) => {
      const mesh = this.el.object3D.getObjectByProperty('type', 'Mesh');
      if (mesh) {
        console.log(`[+] ${mesh.name} mesh: `, mesh);
        console.log(`[+] ${mesh.name} point count: `, mesh.geometry.attributes.position.count);
      } else {
        console.log('[-] No mesh found for component ', this.el);
      }
    });
  },
};
