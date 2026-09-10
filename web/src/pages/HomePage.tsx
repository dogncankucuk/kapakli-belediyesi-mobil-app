import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Baskan, HaberBenzeriIcerik } from "../api";
import {
  getAtikNoktalari,
  getBaskan,
  getCamiler,
  getDuyurular,
  getEgitimKurumlari,
  getHaberler,
  getOnemliKurumlar,
  getParklar,
  getSaglikKurumlari,
  getWifiNoktalari,
  resolveMediaUrl,
} from "../api";
import IcerikKarti from "../components/IcerikKarti";
import { ozetCikar } from "../format";
import logo from "../assets/logo.png";

const HIZLI_ERISIM = [
  { baslik: "Fatura Öde", yol: "/hizmetler", ikon: "💳" },
  { baslik: "Nöbetçi Eczane", yol: "/kent-rehberi", ikon: "⚕️" },
  { baslik: "Kesinti Bilgisi", yol: "/hizmetler", ikon: "⚡" },
  { baslik: "Talep Oluştur", yol: "/hizmetler", ikon: "📝" },
];

function HomePage() {
  const [haberler, setHaberler] = useState<HaberBenzeriIcerik[]>([]);
  const [duyurular, setDuyurular] = useState<HaberBenzeriIcerik[]>([]);
  const [baskan, setBaskan] = useState<Baskan | null>(null);
  const [sayimlar, setSayimlar] = useState<{ etiket: string; deger: number }[]>([]);

  useEffect(() => {
    getHaberler().then((v) => setHaberler(v.slice(0, 3))).catch(() => undefined);
    getDuyurular().then((v) => setDuyurular(v.slice(0, 3))).catch(() => undefined);
    getBaskan().then(setBaskan).catch(() => undefined);

    Promise.all([
      getCamiler(),
      getOnemliKurumlar(),
      getEgitimKurumlari(),
      getSaglikKurumlari(),
      getAtikNoktalari(),
      getWifiNoktalari(),
      getParklar(),
    ])
      .then(([camiler, kurumlar, egitim, saglik, atik, wifi, parklar]) => {
        setSayimlar([
          { etiket: "Kent Rehberi Noktası", deger: camiler.length + kurumlar.length + egitim.length + saglik.length + atik.length + wifi.length + parklar.length },
          { etiket: "Park", deger: parklar.length },
          { etiket: "Eğitim Kurumu", deger: egitim.length },
          { etiket: "Atık Toplama Noktası", deger: atik.length },
        ]);
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <span className="eyebrow eyebrow--light">Kapaklı Belediyesi</span>
            <h1>Kapaklı için birlikte, dijitalde daha yakın.</h1>
            <p className="hero__lead">
              Haberlerden hizmetlere, meclis kararlarından kent rehberine kadar
              belediyemizin tüm dijital hizmetlerine tek adresten ulaşın.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--gold" to="/kent-rehberi">
                Kent Rehberi'ni Keşfet
              </Link>
              <a className="btn btn--ghost-light" href="https://play.google.com/store" target="_blank" rel="noreferrer">
                Mobil Uygulamayı İndir
              </a>
            </div>
          </div>
          <div className="hero__emblem">
            <img src={logo} alt="Kapaklı Belediyesi" />
          </div>
        </div>
      </section>

      <section className="section section--tight quick-access">
        <div className="container quick-access__grid">
          {HIZLI_ERISIM.map((h) => (
            <Link key={h.baslik} to={h.yol} className="quick-access__item">
              <span className="quick-access__icon" aria-hidden="true">
                {h.ikon}
              </span>
              {h.baslik}
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <span className="eyebrow">Güncel</span>
          <div className="section-heading-row">
            <h2>Son Haberler</h2>
            <Link to="/haberler">Tümünü Gör →</Link>
          </div>
          <div className="content-grid">
            {haberler.map((h) => (
              <IcerikKarti key={h.id} icerik={h} detayYolu={`/haberler/${h.id}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container kent-rehberi-teaser">
          <div>
            <span className="eyebrow">Yenilikçi</span>
            <h2>Kapaklı'yı tek haritada keşfedin</h2>
            <p>
              Belediyemizin resmi coğrafi bilgi sisteminden (CBS) beslenen Kent
              Rehberi; dini tesisler, okullar, sağlık kuruluşları, wifi
              noktaları, parklar ve atık toplama noktalarını tek bir
              interaktif haritada bir araya getiriyor.
            </p>
            <Link className="btn btn--primary" to="/kent-rehberi">
              Haritayı Aç
            </Link>
          </div>
          <div className="kent-rehberi-teaser__stats">
            {sayimlar.map((s) => (
              <div key={s.etiket} className="kent-rehberi-teaser__stat">
                <strong>{s.deger}</strong>
                <span>{s.etiket}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {duyurular.length > 0 && (
        <section className="section section--muted">
          <div className="container">
            <span className="eyebrow">Duyurular</span>
            <div className="section-heading-row">
              <h2>Güncel Duyurular</h2>
              <Link to="/duyurular">Tümünü Gör →</Link>
            </div>
            <ul className="announcement-list">
              {duyurular.map((d) => (
                <li key={d.id}>
                  <Link to={`/duyurular/${d.id}`}>{d.baslik}</Link>
                  <p>{ozetCikar(d.icerik, 120)}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {baskan && (
        <section className="section">
          <div className="container baskan-teaser">
            {baskan.photoUrl && (
              <img src={resolveMediaUrl(baskan.photoUrl)} alt={baskan.ad} />
            )}
            <div>
              <span className="eyebrow">Başkanımızdan</span>
              <p className="baskan-teaser__quote">{ozetCikar(baskan.introText, 220)}</p>
              <strong>{baskan.ad}</strong>
              <br />
              <Link to="/baskan">Devamını Oku →</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default HomePage;
