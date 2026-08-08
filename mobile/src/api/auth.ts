import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "./authStorage";
import { BASE_URL } from "./client";

export type CurrentUser = {
  id: string;
  ad: string;
  soyad: string;
  tcKimlikNo: string | null;
  telefon: string | null;
  eposta: string | null;
};

type AuthResponse = { token: string; user: CurrentUser };

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

export type RegisterInput = {
  ad: string;
  soyad: string;
  tcKimlikNo: string;
  telefon: string;
  eposta?: string;
  password: string;
};

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data: AuthResponse = await response.json();
  await setStoredToken(data.token);
  return data;
}

export async function login(
  identifier: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data: AuthResponse = await response.json();
  await setStoredToken(data.token);
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data: AuthResponse = await response.json();
  await setStoredToken(data.token);
  return data;
}

export async function getSessionUser(): Promise<CurrentUser | null> {
  const token = await getStoredToken();
  if (!token) return null;

  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    await clearStoredToken();
    return null;
  }

  return response.json();
}

export function logout(): Promise<void> {
  return clearStoredToken();
}

export async function forgotPassword(identifier: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data: { message: string } = await response.json();
  return data.message;
}

export async function resetPassword(
  identifier: string,
  code: string,
  newPassword: string,
): Promise<string> {
  const response = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, code, newPassword }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data: { message: string } = await response.json();
  return data.message;
}
