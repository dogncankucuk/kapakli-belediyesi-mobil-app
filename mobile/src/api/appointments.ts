import { BASE_URL } from "./client";
import { Appointment, CreateAppointmentBody } from "./types";

export async function createAppointment(
  body: CreateAppointmentBody,
): Promise<Appointment> {
  const response = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Randevu oluşturulamadı");
  }

  return response.json();
}
