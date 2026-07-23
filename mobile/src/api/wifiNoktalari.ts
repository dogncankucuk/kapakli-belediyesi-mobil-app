import { BASE_URL } from "./client";
import { WifiNoktasi } from "./types";

export async function getWifiNoktalari(): Promise<WifiNoktasi[]> {
  const response = await fetch(`${BASE_URL}/wifi-noktalari`);

  if (!response.ok) {
    throw new Error("Wi-Fi noktaları alınamadı");
  }

  return response.json();
}
