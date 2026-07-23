import { BASE_URL } from "./client";
import { MeclisKarari } from "./types";

export async function getMeclisKararlari(): Promise<MeclisKarari[]> {
  const response = await fetch(`${BASE_URL}/meclis-kararlari`);

  if (!response.ok) {
    throw new Error("Meclis kararları alınamadı");
  }

  return response.json();
}
