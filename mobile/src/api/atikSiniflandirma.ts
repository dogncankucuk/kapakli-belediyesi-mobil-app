import { BASE_URL } from "./client";
import { AtikSiniflandirmaSonucu, AtikTaramaIstatistigi } from "./types";

export async function getAtikIstatistik(): Promise<AtikTaramaIstatistigi> {
  const response = await fetch(`${BASE_URL}/atik-siniflandirma/istatistik`);

  if (!response.ok) {
    throw new Error("İstatistik alınamadı");
  }

  return response.json();
}

export async function classifyAtik(
  base64Image: string,
): Promise<AtikSiniflandirmaSonucu> {
  const response = await fetch(`${BASE_URL}/atik-siniflandirma`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error("Atık tanıma servisi şu an kullanılamıyor.");
    }
    throw new Error("Atık tanınamadı, lütfen tekrar deneyin.");
  }

  return response.json();
}
