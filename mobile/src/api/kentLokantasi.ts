import { BASE_URL } from "./client";
import { GununMenusu } from "./types";

export async function getGununMenusu(): Promise<GununMenusu | null> {
  const response = await fetch(`${BASE_URL}/kent-lokantasi/gunun-menusu`);

  if (!response.ok) {
    throw new Error("Günün menüsü alınamadı");
  }

  return response.json();
}
