import { BASE_URL } from "./client";
import { CreateRequestBody, TalepRequest } from "./types";

export async function createRequest(
  body: CreateRequestBody,
): Promise<TalepRequest> {
  const response = await fetch(`${BASE_URL}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Talep oluşturulamadı");
  }

  return response.json();
}

export async function getRequest(id: string): Promise<TalepRequest> {
  const response = await fetch(`${BASE_URL}/requests/${id}`);

  if (!response.ok) {
    throw new Error("Talep bulunamadı");
  }

  return response.json();
}
