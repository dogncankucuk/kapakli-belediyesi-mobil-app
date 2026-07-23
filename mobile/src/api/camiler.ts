import { BASE_URL } from "./client";
import { Cami } from "./types";

export async function getCamiler(): Promise<Cami[]> {
  const response = await fetch(`${BASE_URL}/camiler`);

  if (!response.ok) {
    throw new Error("Camiler alınamadı");
  }

  return response.json();
}
