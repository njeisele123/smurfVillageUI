import * as THREE from "three";

export const initInteriorScene = () => {
  const scene = new THREE.Scene();

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
  );
  scene.add(sphere);

  return scene;
};
