import { BASE_URL } from "./client";
import { AseviBasvuruBody } from "./types";

export async function createAseviBasvuru(
  body: AseviBasvuruBody,
): Promise<{ id: string }> {
  const response = await fetch(`${BASE_URL}/asevi/basvuru`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Başvuru gönderilemedi");
  }

  return response.json();
}
