import { BASE_URL } from "./client";

export type YardimMerkeziSoru = {
  id: string;
  soru: string;
  cevap: string;
};

export async function getYardimMerkeziSorulari(): Promise<YardimMerkeziSoru[]> {
  const response = await fetch(`${BASE_URL}/yardim-merkezi`);

  if (!response.ok) {
    throw new Error("Sorular alınamadı");
  }

  return response.json();
}
