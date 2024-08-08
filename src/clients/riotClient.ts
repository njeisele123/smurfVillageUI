import axios, { AxiosInstance } from "axios";
import { DEV_HOST } from "../constants/constants";
import { ToonShader2 } from "three/examples/jsm/Addons.js";
import { trackApiCall } from "../scripts/apiTracker";

const BASE_URL = `${DEV_HOST}/api/riot`;
enum TIER {
  IRON = "IRON",
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
  EMERALD = "EMERALD",
  DIAMOND = "DIAMOND",
  MASTERS = "MASTERS",
  GRANDMASTERS = "GRANDMASTERS",
  CHALLENGER = "CHALLENGER",
}

const TierOrder = {
  [TIER.IRON]: 0,
  [TIER.BRONZE]: 1,
  [TIER.SILVER]: 2,
  [TIER.GOLD]: 3,
  [TIER.PLATINUM]: 4,
  [TIER.EMERALD]: 5,
  [TIER.DIAMOND]: 6,
  [TIER.MASTERS]: 7,
  [TIER.GRANDMASTERS]: 8,
  [TIER.CHALLENGER]: 9,
};

// Function to compare ranks
export function compareRanks(t1: TIER, t2: TIER) {
  return TierOrder[t1] - TierOrder[t2];
}

type SummonerResponse = {
  gameName: string;
  puuid: string;
  tagLine: string;
};

type SummonerByPuuidResponse = {
  id: string;
};

type LeagueEntry = {
  queue_type: string;
  tier: TIER;
};

export async function getSummonerByName(
  summonerName: string,
  tagLine: string
): Promise<SummonerResponse> {
  try {
    trackApiCall();
    const response = await axios.get(
      `${BASE_URL}/summoner/${summonerName}/${tagLine}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching summoner:", error);
    throw error;
  }
}

export async function getMatches(puuid: string): Promise<string[]> {
  try {
    trackApiCall();
    const response = await axios.get(`${BASE_URL}/matches/${puuid}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
}

export async function getMatch(mid: string): Promise<any> {
  try {
    trackApiCall();
    const response = await axios.get(`${BASE_URL}/match/${mid}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching match:", error);
    throw error;
  }
}

export async function getSummonerById(
  puuid: string
): Promise<SummonerByPuuidResponse> {
  try {
    trackApiCall();
    const response = await axios.get(`${BASE_URL}/summoner-by-id/${puuid}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching summoner:", error);
    throw error;
  }
}

export async function getLeagueEntries(
  summonerId: string
): Promise<LeagueEntry[]> {
  try {
    trackApiCall();
    const response = await axios.get(
      `${BASE_URL}/league-entries/${summonerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching league entries:", error);
    throw error;
  }
}
