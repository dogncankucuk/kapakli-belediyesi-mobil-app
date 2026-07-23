import { BASE_URL } from "./client";
import { Baraj, PlanliKesinti } from "./types";

export async function getBarajlar(): Promise<Baraj[]> {
  const response = await fetch(`${BASE_URL}/barajlar`);

  if (!response.ok) {
    throw new Error("Baraj doluluk bilgisi alınamadı");
  }

  return response.json();
}

export async function getPlanliKesintiler(): Promise<PlanliKesinti[]> {
  const response = await fetch(`${BASE_URL}/planli-kesintiler`);

  if (!response.ok) {
    throw new Error("Planlı kesintiler alınamadı");
  }

  return response.json();
}
