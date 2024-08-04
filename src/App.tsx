import * as THREE from "three";
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { interval } from "rxjs";
import { getMatch, getMatches, getSummonerByName } from "./clients/riotClient";
import { getChampion } from "./clients/glbClient";
import { initVillageScene } from "./scripts/villageScene";

const FPS = 25;
const TICK_INTERVAL = 1000 / FPS;
const scene = initVillageScene();

// Pull the environment/map to its own file

async function getMatchHistory(summonerName: string, tagLine: string) {
  const { puuid } = await getSummonerByName(summonerName, tagLine);
  const matches = await getMatches(puuid);
  if (matches?.length) {
    await getMatch(matches[0]);
  }
}

// Animation loop
function animate(
  controls: OrbitControls,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  requestAnimationFrame(() => animate(controls, renderer, scene, camera));
  controls.update();
  renderer.render(scene, camera);
}

const loader = new GLTFLoader();

function App() {
  const canvasRef = useRef(null);
  const cameraRef = useRef<THREE.Camera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const [, setTick] = useState({});

  const [championMixer, setChampionMixer] = useState<THREE.AnimationMixer>();
  const [championModel, setChampionModel] =
    useState<THREE.Group<THREE.Object3DEventMap>>();

  // init the camera
  useEffect(() => {
    const canvas = document.querySelector(".webGL2")!;
    if (!canvas) {
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

  // rxjs ticker
  useEffect(() => {
    const ticker$ = interval(TICK_INTERVAL);

    const subscription = ticker$.subscribe(() => {
      // Force a re-render by setting a new object as state
      setTick({});
    });

    return () => subscription.unsubscribe();
  }, []);

  // add camera to scene
  useEffect(() => {
    cameraRef?.current && scene.add(cameraRef?.current);
  }, [cameraRef, rendererRef, controlsRef]);

  // animation loop
  useEffect(() => {
    if (
      controlsRef?.current &&
      rendererRef?.current &&
      cameraRef?.current &&
      scene
    ) {
      // sync animation time scale with the ticker
      championMixer &&
        championMixer.update((championMixer.timeScale * 1.0) / FPS);
      animate(
        controlsRef.current,
        rendererRef.current,
        scene,
        cameraRef.current
      );
    }
  });

  const loadChampionToScene = useCallback(
    async (name: string) => {
      const arrayBuffer = await getChampion(name);

      // load from bytesand place in scene
      loader.parse(arrayBuffer, "", function (gltf) {
        const model = gltf.scene;
        model.position.set(0, -0.25, 1.4);
        model.rotation.y = Math.PI / 2;
        model.scale.setScalar(3);
        if (championModel) {
          // remove existing champion model
          scene?.remove(championModel);
        }

        scene?.add(model);

        // play default animation
        const mixer = new THREE.AnimationMixer(model);
        const clips = gltf.animations;
        if (clips?.length) {
          // Create an AnimationAction for the first clip
          const action = mixer.clipAction(clips[0]);
          // Play the action
          action.play();
        }

        setChampionModel(model);
        setChampionMixer(mixer);
      });
    },
    [scene, championModel, championMixer]
  );

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => getMatchHistory("DongleBuster", "bobbo")}>
          pull data
        </button>
        <button onClick={() => loadChampionToScene("Zac")}>Zac</button>
        <button onClick={() => loadChampionToScene(`Kha'zix`)}>Bug</button>
        <button onClick={() => loadChampionToScene("Poppy")}>Poppy</button>
      </div>
      <canvas ref={canvasRef} style={{ left: 0 }} className="webGL2"></canvas>
    </>
  );
}

export default App;
