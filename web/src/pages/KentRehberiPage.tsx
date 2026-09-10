import { useEffect, useRef, useState } from "react";
import type { HaritaNoktasi } from "../api";
import {
  getAtikNoktalari,
  getCamiler,
  getEgitimKurumlari,
  getOnemliKurumlar,
  getParklar,
  getSaglikKurumlari,
  getWifiNoktalari,
} from "../api";
import SayfaBasligi from "../components/SayfaBasligi";
import L, { KAPAKLI_CENTER } from "../leafletSetup";

interface Katman {
  anahtar: string;
  etiket: string;
  renk: string;
  getir: () => Promise<HaritaNoktasi[]>;
}

// "Sağlık" katmani hem hastane hem eczaneleri iceriyor (bkz. Saglik modulu -
// Eczanelerden Ice Aktar) - nobetci eczane donusum takvimini ayri bir katman
// olarak eklemek ayni eczaneleri iki kez gostermek anlamina gelirdi.
const KATMANLAR: Katman[] = [
  { anahtar: "dini-tesis", etiket: "Dini Tesis", renk: "#c9962b", getir: getCamiler },
  { anahtar: "resmi-kurum", etiket: "Resmi Kurum", renk: "#1f5c56", getir: getOnemliKurumlar },
  { anahtar: "egitim", etiket: "Eğitim", renk: "#3b6fa0", getir: getEgitimKurumlari },
  { anahtar: "saglik", etiket: "Sağlık (Hastane & Eczane)", renk: "#c2564b", getir: getSaglikKurumlari },
  { anahtar: "atik", etiket: "Atık Toplama", renk: "#6b8f4e", getir: getAtikNoktalari },
  { anahtar: "wifi", etiket: "Wi-Fi Noktası", renk: "#7b5aa6", getir: getWifiNoktalari },
  { anahtar: "park", etiket: "Parklar", renk: "#4c7a3f", getir: getParklar },
];

function KentRehberiPage() {
  const haritaKapRef = useRef<HTMLDivElement>(null);
  const haritaRef = useRef<L.Map | null>(null);
  const katmanGruplariRef = useRef<Map<string, L.LayerGroup>>(new Map());
  const [aktifKatmanlar, setAktifKatmanlar] = useState<Set<string>>(
    () => new Set(KATMANLAR.map((k) => k.anahtar)),
  );
  const [sayimlar, setSayimlar] = useState<Record<string, number>>({});
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!haritaKapRef.current || haritaRef.current) return;
    const harita = L.map(haritaKapRef.current).setView(KAPAKLI_CENTER, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap katkıda bulunanlar",
    }).addTo(harita);
    haritaRef.current = harita;

    let iptal = false;
    Promise.all(
      KATMANLAR.map(async (katman) => {
        const noktalar = await katman.getir().catch(() => []);
        return { katman, noktalar };
      }),
    ).then((sonuclar) => {
      if (iptal) return;
      const yeniSayimlar: Record<string, number> = {};
      for (const { katman, noktalar } of sonuclar) {
        const grup = L.layerGroup();
        for (const n of noktalar) {
          L.circleMarker([n.lat, n.lng], {
            radius: 7,
            weight: 2,
            color: "#fff",
            fillColor: katman.renk,
            fillOpacity: 0.9,
          })
            .bindPopup(`<strong>${n.ad}</strong>${n.adres ? `<br>${n.adres}` : ""}`)
            .addTo(grup);
        }
        grup.addTo(harita);
        katmanGruplariRef.current.set(katman.anahtar, grup);
        yeniSayimlar[katman.anahtar] = noktalar.length;
      }
      setSayimlar(yeniSayimlar);
      setYukleniyor(false);
    });

    return () => {
      iptal = true;
      harita.remove();
      haritaRef.current = null;
      katmanGruplariRef.current.clear();
    };
  }, []);

  function katmanAcKapa(anahtar: string) {
    setAktifKatmanlar((mevcut) => {
      const yeni = new Set(mevcut);
      const grup = katmanGruplariRef.current.get(anahtar);
      if (yeni.has(anahtar)) {
        yeni.delete(anahtar);
        if (grup && haritaRef.current) haritaRef.current.removeLayer(grup);
      } else {
        yeni.add(anahtar);
        if (grup && haritaRef.current) grup.addTo(haritaRef.current);
      }
      return yeni;
    });
  }

  return (
    <>
      <SayfaBasligi
        eyebrow="Yenilikçi"
        baslik="Kent Rehberi"
        aciklama="Belediyemizin resmi coğrafi bilgi sisteminden beslenen, sürekli güncel Kapaklı haritası."
      />
      <div className="container section">
        <div className="kent-rehberi">
          <aside className="kent-rehberi__legend">
            {KATMANLAR.map((k) => (
              <label key={k.anahtar} className="kent-rehberi__legend-item">
                <input
                  type="checkbox"
                  checked={aktifKatmanlar.has(k.anahtar)}
                  onChange={() => katmanAcKapa(k.anahtar)}
                />
                <span className="kent-rehberi__dot" style={{ background: k.renk }} />
                {k.etiket}
                <span className="kent-rehberi__count">
                  {yukleniyor ? "…" : (sayimlar[k.anahtar] ?? 0)}
                </span>
              </label>
            ))}
          </aside>
          <div className="kent-rehberi__map" ref={haritaKapRef} />
        </div>
      </div>
    </>
  );
}

export default KentRehberiPage;
