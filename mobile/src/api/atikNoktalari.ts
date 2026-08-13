import { BASE_URL } from "./client";
import { AtikNoktasi } from "./types";

export async function getAtikNoktalari(): Promise<AtikNoktasi[]> {
  const response = await fetch(`${BASE_URL}/atik-noktalari`);

  if (!response.ok) {
    throw new Error("Atık noktaları alınamadı");
  }

  return response.json();
}
