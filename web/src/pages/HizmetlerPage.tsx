import { Link } from "react-router-dom";
import SayfaBasligi from "../components/SayfaBasligi";

interface Hizmet {
  baslik: string;
  aciklama: string;
  aksiyon: { etiket: string; yol: string; dis?: boolean };
}

const HIZMETLER: Hizmet[] = [
  {
    baslik: "Fatura Ödeme",
    aciklama: "Su ve emlak vergisi faturalarınızı mobil uygulamamız üzerinden güvenle ödeyin.",
    aksiyon: { etiket: "Uygulamayı İndir", yol: "https://play.google.com/store", dis: true },
  },
  {
    baslik: "Su ve Elektrik Kesintileri",
    aciklama: "Bölgenizdeki planlı su ve elektrik kesintilerini mobil uygulamadan anlık takip edin.",
    aksiyon: { etiket: "Uygulamayı İndir", yol: "https://play.google.com/store", dis: true },
  },
  {
    baslik: "Kazı Çalışmaları",
    aciklama: "Devam eden ve planlanan altyapı kazı çalışmalarının konumlarını görüntüleyin.",
    aksiyon: { etiket: "Uygulamayı İndir", yol: "https://play.google.com/store", dis: true },
  },
  {
    baslik: "Nöbetçi Eczaneler",
    aciklama: "Bugün ve önümüzdeki günlerde nöbetçi olan eczaneleri harita üzerinde bulun.",
    aksiyon: { etiket: "Kent Rehberi'nde Gör", yol: "/kent-rehberi" },
  },
  {
    baslik: "Kent Rehberi",
    aciklama: "Dini tesis, eğitim, sağlık, wifi noktası ve daha fazlasını tek haritada keşfedin.",
    aksiyon: { etiket: "Haritayı Aç", yol: "/kent-rehberi" },
  },
  {
    baslik: "Talep ve Başvurular",
    aciklama: "Arıza, şikayet ve görüşlerinizi mobil uygulama üzerinden belediyemize iletin.",
    aksiyon: { etiket: "Uygulamayı İndir", yol: "https://play.google.com/store", dis: true },
  },
  {
    baslik: "Ulaşım Hizmetleri",
    aciklama: "Kapaklı içi toplu ulaşım hatlarını ve güzergahlarını inceleyin.",
    aksiyon: { etiket: "Uygulamayı İndir", yol: "https://play.google.com/store", dis: true },
  },
  {
    baslik: "Atık Rehberi",
    aciklama: "Atık türüne göre en yakın toplama noktasını Kent Rehberi'nden bulun.",
    aksiyon: { etiket: "Kent Rehberi'nde Gör", yol: "/kent-rehberi" },
  },
];

function HizmetlerPage() {
  return (
    <>
      <SayfaBasligi
        eyebrow="E-Belediye"
        baslik="Hizmetler"
        aciklama="Kapaklı Belediyesi'nin sunduğu dijital hizmetlere buradan ulaşabilirsiniz."
      />
      <div className="container section">
        <div className="service-grid">
          {HIZMETLER.map((h) => (
            <div className="card service-card" key={h.baslik}>
              <h3>{h.baslik}</h3>
              <p>{h.aciklama}</p>
              {h.aksiyon.dis ? (
                <a className="btn btn--outline" href={h.aksiyon.yol} target="_blank" rel="noreferrer">
                  {h.aksiyon.etiket}
                </a>
              ) : (
                <Link className="btn btn--outline" to={h.aksiyon.yol}>
                  {h.aksiyon.etiket}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default HizmetlerPage;
