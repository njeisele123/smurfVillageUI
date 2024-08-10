import * as THREE from "three";
import { useCallback, useEffect, useRef, useState } from "react";
import { interval } from "rxjs";
import { initVillageScene } from "../../scripts/villageScene";
import {
  compareRanks,
  getLeagueEntries,
  getSummonerById,
  getSummonerByName,
} from "../../clients/riotClient";
import { getChampion } from "../../clients/glbClient";
import { addAccounts } from "../../clients/summonerClient";
import { useAccountContext } from "../../contexts/accountContext";
import { initInteriorScene } from "../../scripts/sampleScene";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import {
  Box,
  Cylinder,
  OrbitControls,
  useAnimations,
  useGLTF,
} from "@react-three/drei";

// TODO: move all the stuff with the village scene to its own component
const FPS = 60;
const TICK_INTERVAL = 1000 / FPS;

// TODO: refactor so that the 'get ranks' part lives outside of the scene itself, otherwise too confusing

function SmurfVillage() {
  const { accounts, loadAccounts } = useAccountContext();
  const [retrievedRanks, setRetrievedRanks] = useState(false);
  const [rankInfo, setRankInfo] = useState<Record<string, string>>({});

  const [, setTick] = useState({});

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

  /*const loadChampionToScene = useCallback(
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
  );*/

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
        <Cylinder args={[5, 7, 7, 32]} position={[0, 3, 0]}>
          <meshStandardMaterial color={"#D2B48C"} side={THREE.DoubleSide} />
        </Cylinder>
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
