import { BASE_URL } from "./client";
import { HavaKalitesi } from "./types";

export async function getHavaKalitesi(): Promise<HavaKalitesi> {
  const response = await fetch(`${BASE_URL}/hava-kalitesi`);

  if (!response.ok) {
    throw new Error("Hava kalitesi verisi alınamadı");
  }

  return response.json();
}
