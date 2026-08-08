import { BASE_URL } from "./client";
import { Park } from "./types";

export async function getParklar(): Promise<Park[]> {
  const response = await fetch(`${BASE_URL}/parklar`);

  if (!response.ok) {
    throw new Error("Parklar alınamadı");
  }

  return response.json();
}
