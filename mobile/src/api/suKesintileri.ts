export type TeskiSuKesintisi = {
  baslangic: string;
  bitis: string;
  nedeni: string;
  yer: string;
};

const TESKI_URL = "https://www.teski.gov.tr/sukesintileri/";
// TESKI, tarayici User-Agent'i olmayan istekleri (ornegin RN'in varsayilan
// fetch UA'si) engelliyor - sayfa duz sunucu tarafinda render edildigi icin
// bir WebView'e gerek yok, sadece bir tarayici gibi gorunen bir istek yeterli.
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).trim();
}

function parseKesintiler(html: string): TeskiSuKesintisi[] {
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return [];

  const rows = tbodyMatch[1].match(/<tr>[\s\S]*?<\/tr>/gi) ?? [];

  return rows
    .map((row) => {
      const cells = row.match(/<td>([\s\S]*?)<\/td>/gi) ?? [];
      return cells.map((cell) =>
        stripTags(cell.replace(/^<td>/i, "").replace(/<\/td>$/i, "")),
      );
    })
    .filter((cells) => cells.length >= 4)
    .map((cells) => ({
      baslangic: cells[0],
      bitis: cells[1],
      nedeni: cells[2],
      yer: cells[3].replace(/[\s/]+$/, ""),
    }));
}

export async function getTeskiSuKesintileri(): Promise<TeskiSuKesintisi[]> {
  const response = await fetch(TESKI_URL, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Su kesintileri verisi alınamadı");
  }

  return parseKesintiler(await response.text());
}
