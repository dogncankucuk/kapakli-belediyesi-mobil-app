import { BASE_URL } from "./client";
import { OnemliKurum } from "./types";

export async function getOnemliKurumlar(): Promise<OnemliKurum[]> {
  const response = await fetch(`${BASE_URL}/onemli-kurumlar`);

  if (!response.ok) {
    throw new Error("Önemli kurumlar alınamadı");
  }

  return response.json();
}
