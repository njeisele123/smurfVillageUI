import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  Cylinder,
  OrbitControls,
  useAnimations,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import {
  GLTF,
  GLTFLoader,
  MTLLoader,
  OBJLoader,
} from "three/examples/jsm/Addons.js";
import { getChampion } from "../../clients/glbClient";
import * as THREE from "three";
import { PI } from "three/webgpu";

function MyModel({ url, onClick }: { url: string; onClick: () => void }) {
  const obj = useLoader(OBJLoader, url);
  const ref = useRef<any>();

  return (
    <primitive
      object={obj}
      ref={ref}
      scale={[0.4, 0.4, 0.4]}
      position={[0, 0, -4]}
      rotation={[0, (Math.PI / 2) * 3, 0]}
      onClick={() => {
        onClick();
      }}
    />
  );
}

function Model({ champion }: { champion: string }) {
  const group = useRef();
  const [gltf, setGltf] = useState<GLTF>();
  const { actions } = useAnimations(gltf?.animations ?? [], group);

  useEffect(() => {
    const init = async () => {
      const arrayBuffer = await getChampion(champion);
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

    if (champion) {
      init();
    }
  }, [champion]);

  useEffect(() => {
    if (gltf && actions) {
      // Play the first animation by default
      const action = actions[Object.keys(actions)[0]];
      if (action) action.play();
    }
  }, [gltf, actions]);

  if (!gltf) return null;

  return <primitive object={gltf.scene} ref={group} scale={[1, 1, 1]} />;
}

export default function HouseInteriorCanvas({
  setShowMatchHistory,
  champion,
}: {
  setShowMatchHistory: () => void;
  champion: string;
}) {
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
        <meshStandardMaterial color={"#654321"} side={THREE.DoubleSide} />
      </Cylinder>
      <Suspense fallback={null}>
        <MyModel
          url="resources/bookshelf.obj"
          onClick={() => setShowMatchHistory()}
        />
      </Suspense>
      <OrbitControls />
      <Model champion={champion} />
    </Canvas>
  );
}
