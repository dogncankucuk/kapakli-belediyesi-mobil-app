export function tarihFormatla(isoTarih: string): string {
  return new Date(isoTarih).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Admin panelin zengin metin editorunden gelen icerik HTML olabiliyor -
// ozet/onizlemelerde etiketler gorunmesin diye once duz metne cevriliyor.
export function ozetCikar(metin: string, uzunluk = 160): string {
  const duzMetin = metin
    .replace(/<(p|div|br|li)[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "");
  const temiz = duzMetin.replace(/\s+/g, " ").trim();
  if (temiz.length <= uzunluk) return temiz;
  return `${temiz.slice(0, uzunluk).trim()}…`;
}
