import * as THREE from "three";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  compareRanks,
  getLeagueEntries,
  getSummonerById,
  getSummonerByName,
} from "../../clients/riotClient";
import { useAccountContext } from "../../contexts/accountContext";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Billboard, OrbitControls, Plane, Text } from "@react-three/drei";
import { MTLLoader, OBJLoader } from "three/examples/jsm/Addons.js";

// TODO: move all the stuff with the village scene to its own component
const FPS = 60;
const TICK_INTERVAL = 1000 / FPS;

// TODO: refactor so that the 'get ranks' part lives outside of the scene itself, otherwise too confusing

function SmurfVillage() {
  const { accounts, loadAccounts } = useAccountContext();
  const [retrievedRanks, setRetrievedRanks] = useState(false);
  const [rankInfo, setRankInfo] = useState<Record<string, string>>({});

  // load in latest account data on init
  useEffect(() => {
    loadAccounts();
  }, []);

  const getHighestRank = useCallback(
    async (summonerName: string, tagLine: string) => {
      const { puuid } = await getSummonerByName(summonerName, tagLine);
      const res = await getSummonerById(puuid);
      const entries = await getLeagueEntries(res.id);
      const accountRanks = entries.map(({ tier }) => tier);
      accountRanks.sort(compareRanks);

      if (!accountRanks.length) {
        return "N/A";
      }

      const highest = accountRanks[accountRanks.length - 1];
      console.log(summonerName, " - ", highest);
      return highest;
    },
    []
  );

  const getRanks = useCallback(async () => {
    console.log("EXECUTING THE HIGHEST RANK FUNC");
    const ranks: Record<string, string> = {};
    accounts?.forEach(async (acc) => {
      ranks[acc.summoner_name] = await getHighestRank(
        acc.summoner_name,
        acc.tag_line
      );
    });
    console.log("rank info: ", ranks);
    setRankInfo(ranks);
  }, [accounts]);

  useEffect(() => {
    if (!retrievedRanks && accounts) {
      getRanks();
      setRetrievedRanks(true);
    }
  }, [accounts, retrievedRanks]);

  function SkyBox() {
    const { scene } = useThree();
    const loader = new THREE.CubeTextureLoader();

    const texture = loader.load([
      "resources/skybox/xpos.png", // right
      "resources/skybox/xneg.png", // left
      "resources/skybox/ypos.png", // top
      "resources/skybox/yneg.png", // bottom
      "resources/skybox/zpos.png", // front
      "resources/skybox/zneg.png", // back
    ]);

    scene.background = texture;

    return null;
  }

  function BillboardText() {
    return (
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false} // Lock the rotation on the z axis (default=false)
        position={new THREE.Vector3(0, 4 , 0)}
      >
        <mesh>
          <planeGeometry args={[5, 1.5]} />
          <meshBasicMaterial color="white" transparent opacity={0.5} />
        </mesh>
        <Text fontSize={0.5} color={"black"} position={[0, 0, 0]}>
          I'm a billboard
        </Text>
      </Billboard>
    );
  }

  // https://www.turbosquid.com/AssetManager/Index.cfm?stgAction=getFiles&subAction=Download&intID=1251022&intType=3&csrf=5135AF5CDB4BDBEBF07CE8CFF7449A2BC066B427&showDownload=1&s=1
  function MushroomModel() {
    const [hovered, setHovered] = useState(false);
    const materials = useLoader(MTLLoader, "resources/diamond-shroom.mtl");
    const obj = useLoader(OBJLoader, "resources/gold-shroom.obj", (loader) => {
      materials.preload();
      loader.setMaterials(materials);
    });
    const ref = useRef();

    return (
      <group>
        <BillboardText />
        <primitive
          object={obj}
          ref={ref}
          scale={[0.6, 0.6, 0.6]}
          onPointerOver={() => {
            setHovered(true);
            console.log("ONN");
          }}
          onPointerOut={() => setHovered(false)}
        />
      </group>
    );
  }

  function Ground() {
    return (
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="green" />
      </Plane>
    );
  }

  return (
    <>
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <SkyBox />
        <MushroomModel />
        <Ground />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <OrbitControls />
      </Canvas>
      {accounts?.map((acc) => (
        <div key={acc.summoner_name}>{acc.summoner_name}</div>
      ))}
    </>
  );
}

export default SmurfVillage;
