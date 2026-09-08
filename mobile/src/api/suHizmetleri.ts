import { BASE_URL } from "./client";
import { PlanliKesinti } from "./types";

export async function getPlanliKesintiler(): Promise<PlanliKesinti[]> {
  const response = await fetch(`${BASE_URL}/planli-kesintiler`);

  if (!response.ok) {
    throw new Error("Planlı kesintiler alınamadı");
  }

  return response.json();
}
