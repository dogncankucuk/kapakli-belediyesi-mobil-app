import { BASE_URL } from "./client";
import { Haber } from "./types";

export async function getHaberler(): Promise<Haber[]> {
  const response = await fetch(`${BASE_URL}/haberler`);

  if (!response.ok) {
    throw new Error("Haberler alınamadı");
  }

  return response.json();
}
