import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import BoxCanvas from "./houseInterior";
import { useLocation } from "react-router-dom";
import { getMatch, getMatches } from "../../clients/riotClient";
import Spinner from "../common/spinner";
import { useFrame, useLoader } from "@react-three/fiber";
import HouseInteriorCanvas from "./houseInterior";
import { secondsToGameDuration } from "../../utils/timeUtils";
import { xor } from "three/webgpu";

type Participant = {
  puuid?: string;
  championName?: string;
  win?: boolean;
  deaths?: number;
  kills?: number;
  assists?: number;
  gameDuration?: number;
};

type Match = {
  info: {
    participants: Participant[];
    gameDuration: number;
  };
};

const Modal = ({ isOpen, onClose, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-4xl h-3/4 text-white flex flex-col">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="mt-4 flex-grow overflow-auto">{children}</div>
      </div>
    </div>
  );
};

const House = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [matches, setMatches] = useState<Match[]>([]);
  const [fetchingMatches, setFetchingMatches] = useState(false);
  const [isMatchHistoryOpen, setIsMatchHistoryOpen] = useState(false);

  const puuid = useMemo(() => queryParams.get("puuid"), [queryParams]);

  const loadMatches = useCallback(async (puuid: string) => {
    setFetchingMatches(true);
    const matches = await getMatches(puuid); // strings of match IDs
    const matchData = [];
    const MATCHES_TO_FETCH = 5;

    for (let i = 0; i < Math.min(MATCHES_TO_FETCH, matches.length); i++) {
      matchData.push(await getMatch(matches[i]));
    }

    console.log(matchData);
    setMatches(matchData);
    setFetchingMatches(false);
  }, []);

  const playerData: Participant[] = useMemo(
    () =>
      matches
        .map((match) => {
          const participant = match?.info?.participants?.find(
            (p) => p.puuid === puuid
          );
          return { ...participant, gameDuration: match.info.gameDuration };
        })
        .filter((x) => x !== undefined),
    [puuid, matches]
  );

  useEffect(() => {
    console.log("puuid: ", puuid);
    if (!puuid || matches.length || fetchingMatches) {
      return;
    }

    loadMatches(puuid);
  }, [puuid]);

  const mostPlayedChampion = useMemo(() => {
    const champions = playerData?.map((x) => x.championName).filter(x => x !== undefined);

    const championCounts = champions.reduce((acc: {[name: string]: number}, champion: string) => {
      acc[champion] = (acc[champion] || 0) + 1;
      return acc;
    }, {});

    // Find the champion with the highest count
    let mostPlayed = "";
    let maxCount = 0;

    for (const [champion, count] of Object.entries(championCounts)) {
      if (count > maxCount) {
        mostPlayed = champion;
        maxCount = count;
      }
    }

    return mostPlayed;
  
  }, [playerData]);

  return (
    <>
      <HouseInteriorCanvas
        setShowMatchHistory={() => setIsMatchHistoryOpen(true)}
        champion={mostPlayedChampion}
      />
      <Modal
        isOpen={isMatchHistoryOpen}
        onClose={() => setIsMatchHistoryOpen(false)}
      >
        <h2 className="text-xl font-bold mb-4">Match History</h2>
        {!playerData?.length && <Spinner />}
        {playerData.map(
          ({ championName, kills, deaths, assists, win, gameDuration }) => {
            return (
              <div
                className={`p-4 rounded-md mb-4 shadow-sm ${
                  win ? "bg-green-700" : "bg-red-700"
                } text-white`}
              >
                <span>{championName}</span>{" "}
                <span>
                  {kills} / {deaths} / {assists}{" "}
                </span>
                <span>{secondsToGameDuration(gameDuration ?? 0)}</span>
              </div>
            );
          }
        )}
      </Modal>
    </>
  );
};

export default House;
