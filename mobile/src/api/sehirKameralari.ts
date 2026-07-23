import { BASE_URL } from "./client";
import { SehirKamerasi } from "./types";

export async function getSehirKameralari(): Promise<SehirKamerasi[]> {
  const response = await fetch(`${BASE_URL}/sehir-kameralari`);

  if (!response.ok) {
    throw new Error("Şehir kameraları alınamadı");
  }

  return response.json();
}
