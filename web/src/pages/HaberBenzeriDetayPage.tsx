import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { HaberBenzeriIcerik } from "../api";
import { resolveMediaUrl } from "../api";
import DurumMesaji from "../components/DurumMesaji";
import { tarihFormatla } from "../format";

interface Props {
  geriYolu: string;
  geriEtiketi: string;
  getir: () => Promise<HaberBenzeriIcerik[]>;
}

function youtubeGomEt(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function HaberBenzeriDetayPage({ geriYolu, geriEtiketi, getir }: Props) {
  const { id } = useParams<{ id: string }>();
  const [kayit, setKayit] = useState<HaberBenzeriIcerik | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    let iptal = false;
    setYukleniyor(true);
    setHata(null);
    getir()
      .then((veri) => {
        if (iptal) return;
        const bulunan = veri.find((v) => v.id === id) ?? null;
        setKayit(bulunan);
        if (!bulunan) setHata("Kayıt bulunamadı.");
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
  }, [getir, id]);

  const embed = kayit?.youtubeUrl ? youtubeGomEt(kayit.youtubeUrl) : null;

  return (
    <div className="container section section--narrow">
      <Link to={geriYolu} className="back-link">
        ← {geriEtiketi}
      </Link>

      <DurumMesaji yukleniyor={yukleniyor} hata={hata} />

      {kayit && (
        <article className="detail-article">
          <span className="content-card__date">{tarihFormatla(kayit.yayinTarihi)}</span>
          <h1>{kayit.baslik}</h1>

          {kayit.resimUrlleri.length > 0 && (
            <div className="detail-article__gallery">
              {kayit.resimUrlleri.map((url) => (
                <img key={url} src={resolveMediaUrl(url)} alt="" loading="lazy" />
              ))}
            </div>
          )}

          {embed && (
            <div className="detail-article__video">
              <iframe
                src={embed}
                title={kayit.baslik}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div
            className="detail-article__body"
            dangerouslySetInnerHTML={{ __html: kayit.icerik }}
          />

          {kayit.dosyaUrlleri.length > 0 && (
            <div className="detail-article__files">
              <h4>Ekli Belgeler</h4>
              <ul>
                {kayit.dosyaUrlleri.map((url) => (
                  <li key={url}>
                    <a href={resolveMediaUrl(url)} target="_blank" rel="noreferrer">
                      {decodeURIComponent(url.split("/").pop() ?? url)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      )}
    </div>
  );
}

export default HaberBenzeriDetayPage;
