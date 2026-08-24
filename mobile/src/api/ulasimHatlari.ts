import { BASE_URL } from "./client";
import { CanliOtobus, UlasimHatti } from "./types";

export async function getUlasimHatlari(): Promise<UlasimHatti[]> {
  const response = await fetch(`${BASE_URL}/ulasim-hatlari`);

  if (!response.ok) {
    throw new Error("Ulaşım hatları alınamadı");
  }

  return response.json();
}

export async function getCanliOtobusler(
  hatId: string,
): Promise<CanliOtobus[]> {
  const response = await fetch(`${BASE_URL}/ulasim-hatlari/${hatId}/canli`);

  if (!response.ok) {
    throw new Error("Canlı konum verisi alınamadı");
  }

  return response.json();
}
