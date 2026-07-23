import { BASE_URL } from "./client";
import { Pharmacy } from "./types";

export async function getPharmacies(): Promise<Pharmacy[]> {
  const response = await fetch(`${BASE_URL}/pharmacies`);

  if (!response.ok) {
    throw new Error("Nöbetçi eczaneler alınamadı");
  }

  return response.json();
}
