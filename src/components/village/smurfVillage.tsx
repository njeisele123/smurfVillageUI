import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  compareRanks,
  getLeagueEntries,
  getSummonerById,
  getSummonerByName,
} from "../../clients/riotClient";
import { useAccountContext } from "../../contexts/accountContext";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Billboard, OrbitControls, Plane, Text } from "@react-three/drei";
import { MTLLoader, OBJLoader } from "three/examples/jsm/Addons.js";
import { Outline } from "@react-three/postprocessing";
import Spinner from "../common/spinner";
import { useNavigate } from "react-router-dom";
// TODO: refactor so that the 'get ranks' part lives outside of the scene itself, otherwise too confusing

type AccountRankInfo = {
  rank: string;
  summoner_name: string;
  tag_line: string;
};

const RANK_TO_IDX: any = {
  iron: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  emerald: 5,
  diamond: 6,
};

function SmurfVillage() {
  const navigate = useNavigate();

  const { accounts, loadAccounts } = useAccountContext();
  const [retrievedRanks, setRetrievedRanks] = useState(false);
  const [rankInfo, setRankInfo] = useState<AccountRankInfo[]>();

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
    const ranks = [];
    for (const acc of accounts ?? []) {
      ranks.push({
        summoner_name: acc.summoner_name,
        tag_line: acc.tag_line,
        rank: await getHighestRank(acc.summoner_name, acc.tag_line),
      });
    }

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

  function HouseLabel({
    position,
    text,
  }: {
    position: number[];
    text: string;
  }) {
    return (
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false} // Lock the rotation on the z axis (default=false)
        position={new THREE.Vector3(position[0], position[1] + 4, position[2])}
      >
        <mesh>
          <planeGeometry args={[5, 1.5]} />
          <meshBasicMaterial color="white" transparent opacity={0.5} />
        </mesh>
        <Text fontSize={0.5} color={"black"} position={[0, 0, 0]}>
          {text}
        </Text>
      </Billboard>
    );
  }

  const [mushrooms, setMushrooms] = useState<any[]>([]);

  // load in houses
  useEffect(() => {
    const loadMushroom = (mtlPath: string, objPath: string) => {
      return new Promise((resolve) => {
        const mtlLoader = new MTLLoader();
        mtlLoader.load(mtlPath, (materials) => {
          materials.preload();
          const objLoader = new OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.load(objPath, (object) => {
            resolve(object);
          });
        });
      });
    };

    const ranks = [
      "iron",
      "bronze",
      "silver",
      "gold",
      "platinum",
      "emerald",
      "diamond",
    ];
    const mushFiles = ranks.map((rank) => ({
      rank,
      mtl: `resources/${rank}-shroom.mtl`,
      obj: `resources/${rank}-shroom.obj`,
    }));

    Promise.all(mushFiles.map((data) => loadMushroom(data.mtl, data.obj))).then(
      (loadedMushrooms) => {
        setMushrooms(loadedMushrooms);
      }
    );
  }, []);

  // https://www.turbosquid.com/AssetManager/Index.cfm?stgAction=getFiles&subAction=Download&intID=1251022&intType=3&csrf=5135AF5CDB4BDBEBF07CE8CFF7449A2BC066B427&showDownload=1&s=1
  function MushroomModel({
    position,
    text,
    obj,
  }: {
    position: number[];
    text: string;
    rank: string;
    obj: any;
  }) {
    const [hovered, setHovered] = useState(false);

    // TODO: bug, it is showing same mat for all obj
    return (
      <group>
        <HouseLabel position={position} text={text} />
        <primitive
          object={obj}
          scale={[0.6, 0.6, 0.6]}
          position={position}
          onPointerOver={() => {
            setHovered(true);
            console.log("ONN");
          }}
          onPointerOut={() => setHovered(false)}
          //onClick={() => navigate('/house')} // TODO: make a prompt for them to click 'E' or something
        />
      </group>
    );
  }

  console.log("rank: ", rankInfo);

  if (!rankInfo) {
    return <Spinner />;
  }

  console.log("shrooms: ", mushrooms);

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
        {mushrooms?.length &&
          rankInfo?.map((acc, idx) => {
            return (
              <>
                <MushroomModel
                  key={idx}
                  position={[idx * 7, 0, 0]}
                  text={acc.summoner_name}
                  rank={acc.rank}
                  obj={mushrooms[RANK_TO_IDX[acc.rank.toLowerCase()]].clone()}
                />
              </>
            );
          })}

        <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="green" />
        </Plane>
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <OrbitControls />
      </Canvas>
    </>
  );
}

export default SmurfVillage;
