import { BASE_URL } from "./client";

export type BizeUlasinBilgisi = {
  telefon: string;
  whatsapp: string;
  eposta: string;
  adres: string;
  lat: number;
  lng: number;
};

export async function getBizeUlasin(): Promise<BizeUlasinBilgisi> {
  const response = await fetch(`${BASE_URL}/bize-ulasin`);

  if (!response.ok) {
    throw new Error("İletişim bilgileri alınamadı");
  }

  return response.json();
}
