import { useEffect, useRef, useState } from "react";
import type { BizeUlasin } from "../api";
import { getBizeUlasin } from "../api";
import DurumMesaji from "../components/DurumMesaji";
import SayfaBasligi from "../components/SayfaBasligi";
import L from "../leafletSetup";

function IletisimPage() {
  const [bilgi, setBilgi] = useState<BizeUlasin | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const haritaRef = useRef<HTMLDivElement>(null);
  const haritaOrneginiRef = useRef<L.Map | null>(null);

  useEffect(() => {
    getBizeUlasin()
      .then(setBilgi)
      .catch((err) => setHata(err instanceof Error ? err.message : "İçerik yüklenemedi"))
      .finally(() => setYukleniyor(false));
  }, []);

  useEffect(() => {
    if (!bilgi || !haritaRef.current || haritaOrneginiRef.current) return;
    const harita = L.map(haritaRef.current).setView([bilgi.lat, bilgi.lng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap katkıda bulunanlar",
    }).addTo(harita);
    L.marker([bilgi.lat, bilgi.lng]).addTo(harita).bindPopup("Kapaklı Belediyesi");
    haritaOrneginiRef.current = harita;
    return () => {
      harita.remove();
      haritaOrneginiRef.current = null;
    };
  }, [bilgi]);

  return (
    <>
      <SayfaBasligi eyebrow="Kurumsal" baslik="Bize Ulaşın" />
      <div className="container section">
        <DurumMesaji yukleniyor={yukleniyor} hata={hata} />
        {bilgi && (
          <div className="contact-layout">
            <div className="contact-layout__info card">
              <h3>İletişim Bilgileri</h3>
              <dl>
                <dt>Adres</dt>
                <dd>{bilgi.adres}</dd>
                <dt>Telefon</dt>
                <dd>
                  <a href={`tel:${bilgi.telefon}`}>{bilgi.telefon}</a>
                </dd>
                <dt>WhatsApp</dt>
                <dd>
                  <a href={`https://wa.me/${bilgi.whatsapp}`} target="_blank" rel="noreferrer">
                    {bilgi.whatsapp}
                  </a>
                </dd>
                <dt>E-posta</dt>
                <dd>
                  <a href={`mailto:${bilgi.eposta}`}>{bilgi.eposta}</a>
                </dd>
              </dl>
            </div>
            <div className="contact-layout__map" ref={haritaRef} />
          </div>
        )}
      </div>
    </>
  );
}

export default IletisimPage;
