import axios, { Axios, AxiosInstance } from "axios";
import { DEV_HOST } from "../constants/constants";

const BASE_URL = `${DEV_HOST}/api/summoner`;

type AccountInfo = {
  summoner_name: string;
  tag_line: string;
};

export async function addAccounts(accounts: AccountInfo[]) {
  try {
    const ipResponse = await axios.get(
      "http://ipinfo.io/?format=jsonp&callback=getIP"
    );
    const ip = ipResponse?.data?.ip;

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
