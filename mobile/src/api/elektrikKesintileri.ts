import { BASE_URL } from "./client";
import { ElektrikKesintisi } from "./types";

export async function getElektrikKesintileri(): Promise<ElektrikKesintisi[]> {
  const response = await fetch(`${BASE_URL}/elektrik-kesintileri`);

  if (!response.ok) {
    throw new Error("Elektrik kesintileri alınamadı");
  }

  return response.json();
}
