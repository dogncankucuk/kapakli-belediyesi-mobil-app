import { useEffect, useState } from "react";
import type { Baskan } from "../api";
import { getBaskan, resolveMediaUrl } from "../api";
import DurumMesaji from "../components/DurumMesaji";
import SayfaBasligi from "../components/SayfaBasligi";

function BaskanPage() {
  const [baskan, setBaskan] = useState<Baskan | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    getBaskan()
      .then(setBaskan)
      .catch((err) => setHata(err instanceof Error ? err.message : "İçerik yüklenemedi"))
      .finally(() => setYukleniyor(false));
  }, []);

  return (
    <>
      <SayfaBasligi eyebrow="Kurumsal" baslik="Başkanımız" />
      <div className="container section section--narrow">
        <DurumMesaji yukleniyor={yukleniyor} hata={hata} />
        {baskan && (
          <div className="baskan-layout">
            {baskan.photoUrl && (
              <img className="baskan-layout__photo" src={resolveMediaUrl(baskan.photoUrl)} alt={baskan.ad} />
            )}
            <div>
              <h2>{baskan.ad}</h2>
              <div
                className="detail-article__body"
                dangerouslySetInnerHTML={{ __html: baskan.introText }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BaskanPage;
