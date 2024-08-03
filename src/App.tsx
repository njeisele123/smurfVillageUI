import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { interval } from "rxjs";
import { getMatch, getMatches, getSummonerByName } from "./clients/riotClient";

// TODO: the scene should live outside the animation loop

// Animation loop
function animate(controls: any, renderer: any, scene: any, camera: any) {
  requestAnimationFrame(() => animate(controls, renderer, scene, camera));
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize(camera: any) {
  //camera.aspect = window.innerWidth / window.innerHeight;
  //camera.updateProjectionMatrix(); // TODO: not a function
  //renderer.setSize(window.innerWidth, window.innerHeight);
}

const loader = new GLTFLoader();

const sky = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load("resources/blue.jpg"),
  side: THREE.DoubleSide,
});

const grass = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load("resources/grass.jpg"),
  side: THREE.BackSide,
});

function App() {
  const canvasRef = useRef(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);

  // init the camera
  useEffect(() => {
    const canvas = document.querySelector(".webGL2")!;
    if (!canvas) {
      console.log("No canvas");
      return;
    }

    cameraRef.current = new THREE.PerspectiveCamera(45, 800 / 600);
    cameraRef.current.position.z = 10;

    rendererRef.current = new THREE.WebGLRenderer({ canvas }); //new THREE.WebGLRenderer({canvas});
    rendererRef.current.setSize(800, 600);

    // Orbit controls
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );
  }, [canvasRef]);

  const [, setTick] = useState({});

  // rxjs ticker
  useEffect(() => {
    const ticker$ = interval(500);

    const subscription = ticker$.subscribe(() => {
      // Force a re-render by setting a new object as state
      setTick({});
    });

    return () => subscription.unsubscribe();
  }, []);

  // render the scene every frame
  useEffect(() => {
    if (!cameraRef.current || !rendererRef.current || !controlsRef.current) {
      // no camera yet, can't render
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;

    scene.add(camera);

    // Mushroom cap (red dome)
    const capGeometry = new THREE.SphereGeometry(
      2,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const capMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 2;
    scene.add(cap);

    // White spots on the cap
    const spotGeometry = new THREE.CircleGeometry(0.3, 32);
    const spotMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    // Reduce the number of spots
    const numberOfSpots = 12;

    for (let i = 0; i < numberOfSpots; i++) {
      const spot = new THREE.Mesh(spotGeometry, spotMaterial);

      // Use golden ratio for more even distribution
      const golden_ratio = (1 + Math.sqrt(5)) / 2;
      const theta = (2 * Math.PI * i) / golden_ratio;

      // Adjust phi to create a spiral pattern from top to about 70% down
      const phi = Math.acos(1 - (i / numberOfSpots) * 0.7);

      // Keep the radius at 2.01 to place spots slightly outside the cap
      spot.position.setFromSphericalCoords(2.01, phi, theta);

      // Calculate the normal vector at this point on the sphere
      const normal = new THREE.Vector3().copy(spot.position).normalize();

      // Set the spot's orientation to align with the sphere's surface
      spot.lookAt(spot.position.clone().add(normal));

      cap.add(spot);
    }

    // Mushroom stem (white cylinder)
    const stemGeometry = new THREE.CylinderGeometry(1.2, 1.5, 2, 32);
    const stemMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    scene.add(stem);

    // Door on the stem
    const doorWidth = 0.8;
    const doorHeight = 1.7;
    const doorGeometry2 = new THREE.PlaneGeometry(doorWidth, doorHeight);
    const doorMaterial2 = new THREE.MeshPhongMaterial({ color: 0x8b4513 }); // Brown color
    const door2 = new THREE.Mesh(doorGeometry2, doorMaterial2);

    // Position the door on the front of the stem
    door2.position.set(0, -0.2, 1.4); // Adjust Y to move door up/down, Z should be stem radius

    // Rotate the door to face outward
    door2.rotation.y = 0;

    door2.rotation.x = -Math.PI / 18.5; // Negative angle to tilt backwards

    // Add the door to the stem
    stem.add(door2);

    // Window (blue circle)
    // const windowGeometry = new THREE.CircleGeometry(0.3, 32);
    // const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ff });
    // const window = new THREE.Mesh(windowGeometry, windowMaterial);
    // window.position.set(0, 1.5, 1.9);
    // scene.add(window);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 20);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    loader.load('resources/fizz.glb', function (gltf) {
      
      const model = gltf.scene;
      model.position.set(0, -0.2, 1.4);
      model.rotation.y = Math.PI / 2;
      model.scale.setScalar(3);
      scene.add(model);
    });
  

    // Sky box
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const x = false ? new THREE.MeshBasicMaterial({ color: 0xff0000 }) : sky;
    const cubeMaterials = [sky, sky, sky, grass, sky, sky];
    const cube = new THREE.Mesh(geometry, cubeMaterials);
    cube.position.set(0, 48, 5);

    const geo = new THREE.BoxGeometry(1, 1, 1);

    // Create a blue material
    const mat = new THREE.MeshBasicMaterial({ color: 0x0000ff });

    // Create a mesh with the geometry and material
    const cuby = new THREE.Mesh(geo, mat);
    cuby.position.set(0, -0.2, 1.4);
    scene.add(cube);

    animate(controls, renderer, scene, camera);

    // Handle window resizing
    window.addEventListener("resize", onWindowResize); //, false);
  });

  async function getMatchHistory(summonerName: string, tagLine: string) {
    const { puuid } = await getSummonerByName(summonerName, tagLine);
    const matches = await getMatches(puuid);
    if (matches?.length) {
      await getMatch(matches[0]);
    }
  }

  return (
    <>
      <button onClick={() => getMatchHistory("DongleBuster", "bobbo")}>
        pull data
      </button>

      <canvas ref={canvasRef} style={{ left: 0 }} className="webGL2"></canvas>
    </>
  );
}

export default App;
