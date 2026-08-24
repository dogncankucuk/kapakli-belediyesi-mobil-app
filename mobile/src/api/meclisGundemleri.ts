import { BASE_URL } from "./client";
import { MeclisGundemi } from "./types";

export async function getMeclisGundemleri(): Promise<MeclisGundemi[]> {
  const response = await fetch(`${BASE_URL}/meclis-gundemleri`);

  if (!response.ok) {
    throw new Error("Meclis gündemleri alınamadı");
  }

  return response.json();
}
