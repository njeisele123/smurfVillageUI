import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Cylinder,
  OrbitControls,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { getChampion } from "../../clients/glbClient";
import * as THREE from "three";

function Box(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<any>();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += delta));
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => (event.stopPropagation(), hover(true))}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function Model() {
  const group = useRef();
  const [gltf, setGltf] = useState<GLTF>();
  const { actions } = useAnimations(gltf?.animations ?? [], group);

  useEffect(() => {
    const init = async () => {
      const arrayBuffer = await getChampion("Zac");
      const loader = new GLTFLoader();
      loader.parse(
        arrayBuffer,
        "",
        (gltf) => {
          setGltf(gltf);
        },
        (error) => {
          console.error(
            "An error occurred while loading the GLTF model:",
            error
          );
        }
      );
    };

    init();
  }, []);

  useEffect(() => {
    if (gltf && actions) {
      // Play the first animation by default
      const action = actions[Object.keys(actions)[0]];
      if (action) action.play();
    }
  }, [gltf, actions]);

  if (!gltf) return null;

  return <primitive object={gltf.scene} ref={group} />;
}

export default function BoxCanvas() {
  return (
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Cylinder args={[5, 7, 7, 32]} position={[0, 3, 0]}>
        <meshStandardMaterial color={"#D2B48C"} side={THREE.DoubleSide} />
      </Cylinder>
      <OrbitControls />
      <Model />
    </Canvas>
  );
}
