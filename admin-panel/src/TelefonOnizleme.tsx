import type { ReactNode } from 'react';

interface Props {
  baslik: string;
  children: ReactNode;
}

// Admin panelinde duzenlenen icerigin mobil uygulamada nasil gorunecegini
// canli olarak gosteren telefon-cercevesi mockup'i - GENEL/tek-tip icerikler
// icin (Basvuru Turleri, Ulasim, Su Hizmetleri, Atik Rehberi vb.). Sayfaya
// ozel kart tasarimlarina ihtiyac duyan sayfalarda (haber/ilan/karar/baskan/
// hakkimizda/bize-ulasin) bunun yerine mevcut ./MobilOnizleme.tsx kullanilir.
// Mobil uygulamanin gercek header renklerini (bkz. mobile/src/theme/colors.ts
// - light tema primaryContainer/onPrimary/background) birebir kullanir;
// sayfaya ozel icerik `children` olarak verilir, bu bilesen sadece
// cerceve+header'i saglar.
function TelefonOnizleme({ baslik, children }: Props) {
  return (
    <div className="genel-onizleme-wrap">
      <span className="genel-onizleme-etiket">Mobil Önizleme</span>
      <div className="genel-onizleme-cerceve">
        <div className="genel-onizleme-ekran">
          <div className="genel-onizleme-header">
            <span className="genel-onizleme-geri">←</span>
            <span className="genel-onizleme-baslik">{baslik}</span>
          </div>
          <div className="genel-onizleme-icerik">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default TelefonOnizleme;
