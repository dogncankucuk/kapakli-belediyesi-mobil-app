import { BASE_URL, resolveMediaUrl } from "./client";
import { Ilan } from "./types";

export async function getIlanlar(): Promise<Ilan[]> {
  const response = await fetch(`${BASE_URL}/ilanlar`);

  if (!response.ok) {
    throw new Error("İlanlar alınamadı");
  }

  const data: Ilan[] = await response.json();

  return data.map((item) => ({
    ...item,
    resimUrl: item.resimUrl ? resolveMediaUrl(item.resimUrl) : null,
  }));
}
