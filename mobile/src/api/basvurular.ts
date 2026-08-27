import { BASE_URL } from "./client";
import { Basvuru, BasvuruTuru, CreateBasvuruBody } from "./types";

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    return Array.isArray(data.message)
      ? data.message.join(", ")
      : (data.message ?? "Bir hata oluştu");
  } catch {
    return "Bir hata oluştu";
  }
}

export async function getBasvuruTurleri(): Promise<BasvuruTuru[]> {
  const response = await fetch(`${BASE_URL}/basvuru-turleri`);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function createBasvuru(
  body: CreateBasvuruBody,
): Promise<Basvuru> {
  const response = await fetch(`${BASE_URL}/basvurular`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function getBasvuruDurumu(id: string): Promise<Basvuru> {
  const response = await fetch(`${BASE_URL}/basvurular/${id}`);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}
