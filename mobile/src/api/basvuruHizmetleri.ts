import { BASE_URL } from "./client";
import { BasvuruHizmeti } from "./types";

export async function getBasvuruHizmetleri(): Promise<BasvuruHizmeti[]> {
  const response = await fetch(`${BASE_URL}/basvuru-hizmetleri`);

  if (!response.ok) {
    throw new Error("Başvuru hizmetleri alınamadı");
  }

  return response.json();
}
