import { BASE_URL } from "./client";
import { Ilan } from "./types";

export async function getIlanlar(): Promise<Ilan[]> {
  const response = await fetch(`${BASE_URL}/ilanlar`);

  if (!response.ok) {
    throw new Error("İlanlar alınamadı");
  }

  return response.json();
}
