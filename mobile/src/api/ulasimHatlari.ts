import { BASE_URL } from "./client";
import { UlasimHatti } from "./types";

export async function getUlasimHatlari(): Promise<UlasimHatti[]> {
  const response = await fetch(`${BASE_URL}/ulasim-hatlari`);

  if (!response.ok) {
    throw new Error("Ulaşım hatları alınamadı");
  }

  return response.json();
}
