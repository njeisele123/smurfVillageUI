import axios, { Axios, AxiosInstance } from "axios";
import { DEV_HOST } from "../constants/constants";
import { getIP } from "./ipClient";

const BASE_URL = `${DEV_HOST}/api/summoner`;

export type AccountInfo = {
  summoner_name: string;
  tag_line: string;
};

// TODO: just have 'create all' and 'delete all' for simplicity.
// TODO: eventually switch from IP to some kind of auth to ensure
// that user only makes edits for their own accounts

export async function getAccounts() {
  try {
    const ip = await getIP();
    const response = await axios.get(`${BASE_URL}/accounts/${ip}`);

    return response.data;
  } catch (error) {
    console.error("Error getting accounts:", error);
    throw error;
  }
}

export async function addAccounts(accounts: AccountInfo[]) {
  try {
    const ip = await getIP();

    const response = await axios.post(`${BASE_URL}/accounts`, {
      ip,
      accounts,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding accounts:", error);
    throw error;
  }
}

export async function deleteAccounts() {
  try {
    const ip = await getIP();

    const response = await axios.delete(`${BASE_URL}/accounts/${ip}`);
    return response.data;
  } catch (error) {
    console.error("Error adding accounts:", error);
    throw error;
  }
}
