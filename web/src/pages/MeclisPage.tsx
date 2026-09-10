import { useEffect, useState } from "react";
import type { MeclisGundemi, MeclisKarari } from "../api";
import { getMeclisGundemleri, getMeclisKararlari, resolveMediaUrl } from "../api";
import DurumMesaji from "../components/DurumMesaji";
import SayfaBasligi from "../components/SayfaBasligi";
import { tarihFormatla } from "../format";

function MeclisPage() {
  const [sekme, setSekme] = useState<"gundem" | "kararlar">("gundem");
  const [gundemler, setGundemler] = useState<MeclisGundemi[]>([]);
  const [kararlar, setKararlar] = useState<MeclisKarari[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [acikGundemId, setAcikGundemId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMeclisGundemleri(), getMeclisKararlari()])
      .then(([g, k]) => {
        setGundemler(g);
        setKararlar(k);
      })
      .catch((err) => setHata(err instanceof Error ? err.message : "İçerik yüklenemedi"))
      .finally(() => setYukleniyor(false));
  }, []);

  return (
    <>
      <SayfaBasligi
        eyebrow="Şeffaf Yönetim"
        baslik="Meclis Gündemi & Kararları"
        aciklama="Belediye meclisi toplantı gündemlerini ve alınan kararları buradan takip edebilirsiniz."
      />
      <div className="container section">
        <div className="tab-bar">
          <button
            type="button"
            className={sekme === "gundem" ? "is-active" : ""}
            onClick={() => setSekme("gundem")}
          >
            Meclis Gündemi
          </button>
          <button
            type="button"
            className={sekme === "kararlar" ? "is-active" : ""}
            onClick={() => setSekme("kararlar")}
          >
            Meclis Kararları
          </button>
        </div>

        <DurumMesaji yukleniyor={yukleniyor} hata={hata} />

        {!yukleniyor && !hata && sekme === "gundem" && (
          <div className="accordion">
            {gundemler.length === 0 && <p className="state-message">Kayıt bulunamadı.</p>}
            {gundemler.map((g) => (
              <div className="accordion__item" key={g.id}>
                <button
                  type="button"
                  className="accordion__trigger"
                  onClick={() => setAcikGundemId(acikGundemId === g.id ? null : g.id)}
                >
                  <span>{g.baslik}</span>
                  <span className="content-card__date">{tarihFormatla(g.tarih)}</span>
                </button>
                {acikGundemId === g.id && (
                  <div
                    className="accordion__body"
                    dangerouslySetInnerHTML={{ __html: g.icerik }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {!yukleniyor && !hata && sekme === "kararlar" && (
          <div className="table-list">
            {kararlar.length === 0 && <p className="state-message">Kayıt bulunamadı.</p>}
            {kararlar.map((k) => (
              <div className="table-list__row" key={k.id}>
                <div>
                  <span className="badge">{k.kararNo}</span>
                  <h3>{k.baslik}</h3>
                  <span className="content-card__date">
                    {k.kategori} · {tarihFormatla(k.tarih)}
                  </span>
                </div>
                {k.dosyaUrlleri[0] && (
                  <a className="btn btn--outline" href={resolveMediaUrl(k.dosyaUrlleri[0])} target="_blank" rel="noreferrer">
                    Belgeyi Görüntüle
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default MeclisPage;
