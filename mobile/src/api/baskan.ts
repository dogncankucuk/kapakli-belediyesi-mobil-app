import { BASE_URL, resolveMediaUrl } from "./client";

export type BaskanBilgisi = {
  ad: string;
  photoUrl: string | null;
  introText: string;
  maddeler: string[];
  kapanisText: string;
};

export async function getBaskanBilgisi(): Promise<BaskanBilgisi> {
  const response = await fetch(`${BASE_URL}/baskan`);

  if (!response.ok) {
    throw new Error("Başkan bilgileri alınamadı");
  }

  const data: BaskanBilgisi = await response.json();

  return {
    ...data,
    photoUrl: data.photoUrl ? resolveMediaUrl(data.photoUrl) : null,
  };
}
