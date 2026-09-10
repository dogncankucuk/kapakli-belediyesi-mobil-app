import { useEffect, useState } from "react";
import { getHakkimizda } from "../api";
import DurumMesaji from "../components/DurumMesaji";
import SayfaBasligi from "../components/SayfaBasligi";

function HakkimizdaPage() {
  const [metin, setMetin] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    getHakkimizda()
      .then((veri) => setMetin(veri.baskanOzetMetni))
      .catch((err) => setHata(err instanceof Error ? err.message : "İçerik yüklenemedi"))
      .finally(() => setYukleniyor(false));
  }, []);

  return (
    <>
      <SayfaBasligi eyebrow="Kurumsal" baslik="Hakkımızda" />
      <div className="container section section--narrow">
        <DurumMesaji yukleniyor={yukleniyor} hata={hata} />
        {metin && (
          <div className="detail-article__body" dangerouslySetInnerHTML={{ __html: metin }} />
        )}
      </div>
    </>
  );
}

export default HakkimizdaPage;
