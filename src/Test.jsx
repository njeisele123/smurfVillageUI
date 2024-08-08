import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { interval } from 'rxjs';

function Test() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  const [, setTick] = useState({});

  useEffect(() => {
    // Set up scene, camera, and renderer
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    rendererRef.current = new THREE.WebGLRenderer();

    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(rendererRef.current.domElement);

    // Set up your scene here
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    sceneRef.current.add(cube);

    cameraRef.current.position.z = 5;

    // Set up ticker
    const ticker$ = interval(1000 / 60); // 60 FPS

    const subscription = ticker$.subscribe(() => {
      // Update scene here
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      // Render
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      // Force component update
      setTick({});
    });

    return () => {
      subscription.unsubscribe();
      mountRef.current.removeChild(rendererRef.current.domElement);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={mountRef}></div>;
}

export default Test;