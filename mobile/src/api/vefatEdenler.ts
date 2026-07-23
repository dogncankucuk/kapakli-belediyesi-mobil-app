import { BASE_URL } from "./client";
import { VefatIlani } from "./types";

export async function getVefatIlanlari(): Promise<VefatIlani[]> {
  const response = await fetch(`${BASE_URL}/vefat-edenler`);

  if (!response.ok) {
    throw new Error("Vefat ilanları alınamadı");
  }

  return response.json();
}
