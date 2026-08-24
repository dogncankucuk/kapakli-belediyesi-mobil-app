// Medya sayfasi ve Medyadan Sec modalinda ortak kullanilan dosya uzantisi
// cikarma yardimcisi - uzantiya gore filtreleme icin.
export function dosyaUzantisi(dosyaAdi: string): string {
  const noktaIndex = dosyaAdi.lastIndexOf('.');
  if (noktaIndex === -1 || noktaIndex === dosyaAdi.length - 1) return '';
  return dosyaAdi.slice(noktaIndex + 1).toLocaleLowerCase('tr-TR');
}
