import type { ReactNode } from 'react';

interface TelefonOnizlemeProps {
  baslik: string;
  children: ReactNode;
  varyant?: 'renkli' | 'duz';
  sagIkon?: 'search' | 'help';
}

export function TelefonOnizleme({ baslik, children, varyant = 'renkli', sagIkon }: TelefonOnizlemeProps) {
  return (
    <div className="telefon-onizleme">
      <div className="telefon-onizleme-ekran">
        {varyant === 'renkli' ? (
          <div className="telefon-onizleme-header">
            <span className="telefon-onizleme-geri">←</span>
            <span className="telefon-onizleme-baslik">{baslik}</span>
          </div>
        ) : (
          <div className="telefon-onizleme-header telefon-onizleme-header-duz">
            <span className="telefon-onizleme-geri-duz">←</span>
            <span className="telefon-onizleme-baslik-duz">{baslik}</span>
            {sagIkon && (
              <span className="telefon-onizleme-sagikon">
                {sagIkon === 'search' ? '🔍' : '?'}
              </span>
            )}
          </div>
        )}
        <div className="telefon-onizleme-govde">{children}</div>
      </div>
    </div>
  );
}

function tarihFormatla(tarih: string): string {
  if (!tarih) return 'Tarih';
  const d = new Date(tarih);
  if (isNaN(d.getTime())) return 'Tarih';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function OnizlemeBosMetin({ children }: { children: ReactNode }) {
  return <p className="onizleme-bos-metin">{children}</p>;
}

export function IcerikKartiOnizleme({ baslik, icerik, resimUrlleri, tarih, dosyaUrlleri, youtubeUrl }: {
  baslik: string; icerik: string; resimUrlleri?: string[]; tarih: string; dosyaUrlleri?: string[]; youtubeUrl?: string | null;
}) {
  const kapakResmi = resimUrlleri?.[0];
  const dosyaSayisi = dosyaUrlleri?.length ?? 0;
  return (
    <div className="onizleme-kart">
      {kapakResmi && <img src={kapakResmi} className="onizleme-kart-resim" alt="" />}
      <div className="onizleme-kart-baslik">{baslik || 'Başlık'}</div>
      {icerik && <div className="onizleme-kart-icerik">{icerik}</div>}
      <div className="onizleme-kart-footer">
        <span className="onizleme-kart-tarih">
          {tarihFormatla(tarih)}
          {dosyaSayisi > 0 && (
            <span className="onizleme-kart-ikon">
              {' '}📄{dosyaSayisi > 1 ? `×${dosyaSayisi}` : ''}
            </span>
          )}
          {youtubeUrl && <span className="onizleme-kart-ikon"> 🎬</span>}
        </span>
        <span className="onizleme-kart-chevron">⌄</span>
      </div>
    </div>
  );
}

export function BelgeKartiOnizleme({ baslik, dosyaVarMi }: { baslik: string; dosyaVarMi: boolean }) {
  return (
    <div className="onizleme-kart onizleme-kart-satir">
      <span className="onizleme-kart-satir-baslik">{baslik || 'Başlık'}</span>
      {dosyaVarMi && <span className="onizleme-kart-ikon">↗</span>}
    </div>
  );
}

export function KararKartiOnizleme({ kararNo, kategori, baslik, tarih, dosyaUrlleri, youtubeUrl }: {
  kararNo: string; kategori: string; baslik: string; tarih: string; dosyaUrlleri?: string[]; youtubeUrl?: string | null;
}) {
  const dosyaSayisi = dosyaUrlleri?.length ?? 0;
  return (
    <div className="onizleme-kart">
      <div className="onizleme-karar-ust">
        <span className="onizleme-karar-no">{kararNo || 'Karar No'}</span>
        <span className="onizleme-karar-kategori">{kategori || 'Kategori'}</span>
      </div>
      <div className="onizleme-karar-baslik">{baslik || 'Başlık'}</div>
      <div className="onizleme-karar-tarih">
        {tarihFormatla(tarih)}
        {dosyaSayisi > 0 && (
          <span className="onizleme-kart-ikon">
            {' '}📄{dosyaSayisi > 1 ? `×${dosyaSayisi}` : ''}
          </span>
        )}
        {youtubeUrl && <span className="onizleme-kart-ikon"> 🎬</span>}
      </div>
    </div>
  );
}

export function BaskanOnizleme({ ad, photoUrl, introText, maddeler, kapanisText }: {
  ad: string; photoUrl?: string | null; introText: string; maddeler: string[]; kapanisText: string;
}) {
  return (
    <>
      <div className="onizleme-baskan-hero">
        <div className="onizleme-baskan-foto-dis">
          <div className="onizleme-baskan-foto-ic">
            {photoUrl && <img src={photoUrl} alt="" />}
          </div>
        </div>
        <div className="onizleme-baskan-ad">{ad || 'Ad Soyad'}</div>
        <div className="onizleme-baskan-ayrac" />
        <div className="onizleme-baskan-rol">KAPAKLI BELEDİYE BAŞKANI</div>
      </div>
      {introText && <p className="onizleme-paragraf">{introText}</p>}
      {maddeler.length > 0 && (
        <div className="onizleme-baskan-bio">
          <div className="onizleme-bolum-basligi-kucuk">Özgeçmiş</div>
          {maddeler.map((madde, i) => (
            <div key={i} className="onizleme-bullet-row">
              <span className="onizleme-bullet-dot" />
              <span className="onizleme-paragraf">{madde}</span>
            </div>
          ))}
        </div>
      )}
      {kapanisText && <p className="onizleme-paragraf">{kapanisText}</p>}
    </>
  );
}

export function HakkimizdaOnizleme({ baskanOzetMetni, tarihceParagraflari, kurulusYili, buyuksehirYili, nufus }: {
  baskanOzetMetni: string; tarihceParagraflari: string[]; kurulusYili: string; buyuksehirYili: string; nufus: string;
}) {
  return (
    <>
      <div className="onizleme-hakkimizda-hero">Hakkımızda</div>
      <div className="onizleme-kart onizleme-hakkimizda-kart">
        <div className="onizleme-kart-baslik-satir">
          <span>Başkanımız</span>
          <span className="onizleme-chevron-right">›</span>
        </div>
        {baskanOzetMetni && <p className="onizleme-paragraf">{baskanOzetMetni}</p>}
      </div>
      <div className="onizleme-kart onizleme-hakkimizda-kart">
        <div className="onizleme-kart-baslik-satir">
          <span>Kapaklı'nın Tarihçesi</span>
        </div>
        {tarihceParagraflari.map((p, i) => (
          <p key={i} className="onizleme-paragraf">{p}</p>
        ))}
      </div>
      <div className="onizleme-istatistik-satiri">
        <div className="onizleme-istatistik">
          <span className="onizleme-istatistik-deger">{kurulusYili || '—'}</span>
          <span className="onizleme-istatistik-etiket">Belediye</span>
        </div>
        <div className="onizleme-istatistik">
          <span className="onizleme-istatistik-deger">{buyuksehirYili || '—'}</span>
          <span className="onizleme-istatistik-etiket">İlçe Oldu</span>
        </div>
        <div className="onizleme-istatistik">
          <span className="onizleme-istatistik-deger">{nufus || '—'}</span>
          <span className="onizleme-istatistik-etiket">Nüfus (2025)</span>
        </div>
      </div>
    </>
  );
}

export function YardimMerkeziKartiOnizleme({ soru }: { soru: string }) {
  return (
    <div className="onizleme-kart">
      <div className="onizleme-kart-baslik-satir">
        <span>{soru || 'Soru'}</span>
        <span className="onizleme-chevron-right">›</span>
      </div>
    </div>
  );
}

export function BizeUlasinOnizleme({ telefon, whatsapp, eposta, adres }: {
  telefon: string; whatsapp: string; eposta: string; adres: string;
}) {
  return (
    <>
      <div className="onizleme-cagri-kart">
        <div className="onizleme-cagri-ikon">📞</div>
        <div>
          <div className="onizleme-cagri-etiket">ÇAĞRI MERKEZİ</div>
          <div className="onizleme-cagri-numara">{telefon || 'Telefon'}</div>
        </div>
      </div>
      <div className="onizleme-iletisim-satiri">
        <div className="onizleme-iletisim-kart">
          <span>💬</span>
          <span>{whatsapp ? 'WhatsApp' : 'WhatsApp yok'}</span>
        </div>
        <div className="onizleme-iletisim-kart">
          <span>✉️</span>
          <span>{eposta ? 'E-posta' : 'E-posta yok'}</span>
        </div>
      </div>
      <div className="onizleme-kart onizleme-adres-kart">
        <div className="onizleme-kart-baslik-satir">
          <span>Belediye Binası</span>
        </div>
        <p className="onizleme-paragraf onizleme-adres-metin">{adres || 'Adres'}</p>
        <div className="onizleme-harita-yer-tutucu">📍</div>
      </div>
    </>
  );
}
