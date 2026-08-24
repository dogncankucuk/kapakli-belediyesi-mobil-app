import { BASE_URL } from "./client";

export type HakkimizdaBilgisi = {
  baskanOzetMetni: string;
  tarihcePhotoUrl: string | null;
  tarihceParagraflari: string[];
  kurulusYili: string;
  buyuksehirYili: string;
  nufus: string;
};

export async function getHakkimizda(): Promise<HakkimizdaBilgisi> {
  const response = await fetch(`${BASE_URL}/hakkimizda`);

  if (!response.ok) {
    throw new Error("Hakkımızda içeriği alınamadı");
  }

  return response.json();
}
