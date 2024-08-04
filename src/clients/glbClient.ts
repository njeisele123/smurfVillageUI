import { DEV_HOST } from "../constants/constants";

const BASE_URL = `${DEV_HOST}/api/glb`;

export async function getChampion(name: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/champion/${name}`, {
      cache: "no-store",
    });

    // Using this b/c Axios doesn't have builtin arrayBuffer method
    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error fetching champion model:", error);
    throw error;
  }
}
