import { useCallback, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import BoxCanvas from "./box";
import { useLocation } from "react-router-dom";
import { getMatch, getMatches } from "../../clients/riotClient";

type Participant = {
  puuid: string;
  championName: string;
  win: boolean;
  deaths: number;
  kills: number;
  assists: number;
};

type Match = {
  info: {
    participants: Participant[];
  };
};

// TODO: show most recently played champ (that is on server)
// and scores/wins


const House = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [matches, setMatches] = useState<Match[]>([]);
  const [fetchingMatches, setFetchingMatches] = useState(false);

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
        .map((match) =>
          match?.info?.participants?.find((p) => p.puuid === puuid)
        )
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

  return (
    <>
      <BoxCanvas />
      {playerData.map(({ championName, kills, deaths, assists, win }) => {
        return (
          <>
            <div>{championName}</div>
            <div>{kills}</div>
            <div>{deaths}</div>
            <div>{assists}</div>
            <hr />
          </>
        );
      })}
    </>
  );
};

export default House;
