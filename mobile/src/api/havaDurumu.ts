import { BASE_URL } from "./client";
import { HavaDurumu } from "./types";

export async function getHavaDurumu(): Promise<HavaDurumu> {
  const response = await fetch(`${BASE_URL}/hava-durumu`);

  if (!response.ok) {
    throw new Error("Hava durumu verisi alınamadı");
  }

  return response.json();
}
