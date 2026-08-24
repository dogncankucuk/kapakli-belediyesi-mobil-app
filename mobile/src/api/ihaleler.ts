import { BASE_URL } from "./client";
import { Ihale } from "./types";

export async function getIhaleler(): Promise<Ihale[]> {
  const response = await fetch(`${BASE_URL}/ihaleler`);

  if (!response.ok) {
    throw new Error("İhaleler alınamadı");
  }

  return response.json();
}
