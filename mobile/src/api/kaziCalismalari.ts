import { BASE_URL } from "./client";
import { Kazi } from "./types";

export async function getKaziCalismalari(): Promise<Kazi[]> {
  const response = await fetch(`${BASE_URL}/kazi-calismalari`);

  if (!response.ok) {
    throw new Error("Kazı çalışmaları alınamadı");
  }

  return response.json();
}
