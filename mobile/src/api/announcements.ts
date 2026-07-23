import { BASE_URL } from "./client";
import { Announcement } from "./types";

export async function getAnnouncements(): Promise<Announcement[]> {
  const response = await fetch(`${BASE_URL}/announcements`);

  if (!response.ok) {
    throw new Error("Duyurular alınamadı");
  }

  return response.json();
}
