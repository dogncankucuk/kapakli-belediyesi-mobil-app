// csvExport.ts'in ürettiği (BOM'lu, tırnak içindeki virgül/yeni satır/tırnak
// kaçışlı) CSV formatını okumak için genel bir ayrıştırıcı - RFC4180'in
// temel kurallarını (çift tırnakla kaçış, tırnak içinde virgül/satır sonu)
// destekler.
export function csvOku(dosyaIcerigi: string): string[][] {
  const metin = dosyaIcerigi.replace(/^﻿/, '');
  const satirlar: string[][] = [];
  let satir: string[] = [];
  let alan = '';
  let tirnakIcinde = false;

  for (let i = 0; i < metin.length; i++) {
    const c = metin[i];
    if (tirnakIcinde) {
      if (c === '"') {
        if (metin[i + 1] === '"') {
          alan += '"';
          i++;
        } else {
          tirnakIcinde = false;
        }
      } else {
        alan += c;
      }
      continue;
    }
    if (c === '"') {
      tirnakIcinde = true;
    } else if (c === ',') {
      satir.push(alan);
      alan = '';
    } else if (c === '\r') {
      // \n ile birlikte gelecek, atla
    } else if (c === '\n') {
      satir.push(alan);
      satirlar.push(satir);
      satir = [];
      alan = '';
    } else {
      alan += c;
    }
  }
  if (alan.length > 0 || satir.length > 0) {
    satir.push(alan);
    satirlar.push(satir);
  }

  return satirlar.filter((s) => s.some((deger) => deger.trim() !== ''));
}
