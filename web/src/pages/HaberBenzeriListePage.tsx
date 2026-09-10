import { useEffect, useState } from "react";
import type { HaberBenzeriIcerik } from "../api";
import DurumMesaji from "../components/DurumMesaji";
import IcerikKarti from "../components/IcerikKarti";
import SayfaBasligi from "../components/SayfaBasligi";

interface Props {
  eyebrow: string;
  baslik: string;
  aciklama: string;
  yolOnEki: string;
  getir: () => Promise<HaberBenzeriIcerik[]>;
}

function HaberBenzeriListePage({ eyebrow, baslik, aciklama, yolOnEki, getir }: Props) {
  const [kayitlar, setKayitlar] = useState<HaberBenzeriIcerik[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    let iptal = false;
    setYukleniyor(true);
    setHata(null);
    getir()
      .then((veri) => {
        if (!iptal) setKayitlar(veri);
      })
      .catch((err) => {
        if (!iptal) setHata(err instanceof Error ? err.message : "İçerik yüklenemedi");
      })
      .finally(() => {
        if (!iptal) setYukleniyor(false);
      });
    return () => {
      iptal = true;
    };
  }, [getir]);

  return (
    <>
      <SayfaBasligi eyebrow={eyebrow} baslik={baslik} aciklama={aciklama} />
      <div className="container section">
        <DurumMesaji yukleniyor={yukleniyor} hata={hata} bos={!yukleniyor && !hata && kayitlar.length === 0} />
        {!yukleniyor && !hata && kayitlar.length > 0 && (
          <div className="content-grid">
            {kayitlar.map((kayit) => (
              <IcerikKarti key={kayit.id} icerik={kayit} detayYolu={`${yolOnEki}/${kayit.id}`} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default HaberBenzeriListePage;
