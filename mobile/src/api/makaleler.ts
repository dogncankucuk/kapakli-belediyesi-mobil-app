import { BASE_URL } from "./client";
import { Makale } from "./types";

export async function getMakaleler(): Promise<Makale[]> {
  const response = await fetch(`${BASE_URL}/makaleler`);

  if (!response.ok) {
    throw new Error("Makaleler alınamadı");
  }

  return response.json();
}
