import axios, { AxiosInstance } from "axios";
import { DEV_HOST } from "../constants/constants";

const BASE_URL = `${DEV_HOST}/api/riot`;

type SummonerResponse = {
  gameName: string;
  puuid: string;
  tagLine: string;
};

export async function getSummonerByName(
  summonerName: string,
  tagLine: string
): Promise<SummonerResponse> {
  try {
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
    const response = await axios.get(
      `${BASE_URL}/matches/${puuid}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
}

export async function getMatch(mid: string): Promise<any> {
    try {
      const response = await axios.get(
        `${BASE_URL}/match/${mid}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching match:", error);
      throw error;
    }
  }
  
