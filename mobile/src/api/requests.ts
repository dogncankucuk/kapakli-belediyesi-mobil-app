import { getStoredToken } from "./authStorage";
import { BASE_URL } from "./client";
import { CreateRequestBody, TalepRequest } from "./types";

export async function createRequest(
  body: CreateRequestBody,
): Promise<TalepRequest> {
  // Oturum acik olan kullanicinin talebi kendi hesabina baglanabilsin diye
  // (durum degisikligi bildirimi icin) - token yoksa misafir akisi olarak
  // Authorization header'i olmadan gonderilir, backend bunu userId=null kabul eder.
  const token = await getStoredToken();
  const response = await fetch(`${BASE_URL}/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
