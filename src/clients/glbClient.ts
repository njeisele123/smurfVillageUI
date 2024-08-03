import axios, { AxiosInstance } from "axios";
import { DEV_HOST } from "../constants/constants";

const BASE_URL = `${DEV_HOST}/api/glb`;

export async function getChampion(champion: string): Promise<any> {
  try {
    const response = await axios.get(
      `${BASE_URL}/champion/Zac`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching summoner:", error);
    throw error;
  }
}
  
