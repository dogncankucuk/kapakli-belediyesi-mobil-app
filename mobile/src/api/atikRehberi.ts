import { BASE_URL } from "./client";
import { AtikRehberiIcerik } from "./types";

export async function getAtikRehberi(): Promise<AtikRehberiIcerik[]> {
  const response = await fetch(`${BASE_URL}/atik-rehberi`);

  if (!response.ok) {
    throw new Error("Atık rehberi içeriği alınamadı");
  }

  return response.json();
}
