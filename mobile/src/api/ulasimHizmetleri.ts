import { BASE_URL } from "./client";
import { UlasimSecenegi } from "./types";

export async function getUlasimHizmetleri(): Promise<UlasimSecenegi[]> {
  const response = await fetch(`${BASE_URL}/ulasim-hizmetleri`);

  if (!response.ok) {
    throw new Error("Ulaşım hizmetleri alınamadı");
  }

  return response.json();
}
