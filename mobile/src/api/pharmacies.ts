import { BASE_URL } from "./client";
import { Pharmacy } from "./types";

export async function getPharmacies(): Promise<Pharmacy[]> {
  const response = await fetch(`${BASE_URL}/pharmacies`);

  if (!response.ok) {
    throw new Error("Eczaneler alınamadı");
  }

  return response.json();
}

// Bugun nobetci olan eczaneler - admin panelden elle girilen nobetTarihi
// alanina gore filtrelenir (bkz. backend PharmaciesService.findNobetci).
export async function getNobetciEczaneler(): Promise<Pharmacy[]> {
  const response = await fetch(`${BASE_URL}/pharmacies/nobetci`);

  if (!response.ok) {
    throw new Error("Nöbetçi eczaneler alınamadı");
  }

  return response.json();
}
