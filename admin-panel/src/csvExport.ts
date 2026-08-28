// Excel'de dogrudan acilabilen, UTF-8 BOM'lu CSV indirme yardimcisi -
// PharmaciesPage'deki TEO CSV indirme ile ayni Blob+indirme deseni.
export function csvIndir(
  dosyaAdi: string,
  basliklar: string[],
  satirlar: (string | number)[][],
) {
  const kacir = (deger: string | number) => {
    const metin = String(deger ?? '');
    if (/[",\n]/.test(metin)) return `"${metin.replace(/"/g, '""')}"`;
    return metin;
  };
  const icerik = [basliklar, ...satirlar]
    .map((satir) => satir.map(kacir).join(','))
    .join('\r\n');
  const blob = new Blob(['﻿' + icerik], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dosyaAdi;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
