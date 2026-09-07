import { getStoredToken } from "./authStorage";
import { BASE_URL } from "./client";

export async function registerPushToken(
  token: string,
  platform: "ios" | "android",
): Promise<void> {
  const authToken = await getStoredToken();
  if (!authToken) return;

  const response = await fetch(`${BASE_URL}/push-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token, platform }),
  });

  if (!response.ok) {
    throw new Error("Push token kaydedilemedi");
  }
}

export async function deletePushToken(token: string): Promise<void> {
  const authToken = await getStoredToken();
  if (!authToken) return;

  const response = await fetch(`${BASE_URL}/push-tokens`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error("Push token silinemedi");
  }
}
