import { BASE_URL, resolveMediaUrl } from "./client";
import { Announcement } from "./types";

export async function getAnnouncements(): Promise<Announcement[]> {
  const response = await fetch(`${BASE_URL}/announcements`);

  if (!response.ok) {
    throw new Error("Duyurular alınamadı");
  }

  const data: Announcement[] = await response.json();

  return data.map((item) => ({
    ...item,
    resimUrl: item.resimUrl ? resolveMediaUrl(item.resimUrl) : null,
  }));
}
