import { BASE_URL } from "./client";
import { TarihiYer } from "./types";

export async function getTarihiYerler(): Promise<TarihiYer[]> {
  const response = await fetch(`${BASE_URL}/tarihi-yerler`);

  if (!response.ok) {
    throw new Error("Tarihi yerler alınamadı");
  }

  return response.json();
}
