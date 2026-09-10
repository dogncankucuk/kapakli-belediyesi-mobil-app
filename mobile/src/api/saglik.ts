import { BASE_URL } from "./client";
import { SaglikKurumu } from "./types";

export async function getSaglikKurumlari(): Promise<SaglikKurumu[]> {
  const response = await fetch(`${BASE_URL}/saglik`);

  if (!response.ok) {
    throw new Error("Sağlık kuruluşları alınamadı");
  }

  return response.json();
}
