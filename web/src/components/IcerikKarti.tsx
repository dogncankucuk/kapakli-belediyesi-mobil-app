import { Link } from "react-router-dom";
import type { HaberBenzeriIcerik } from "../api";
import { resolveMediaUrl } from "../api";
import { ozetCikar, tarihFormatla } from "../format";

interface Props {
  icerik: HaberBenzeriIcerik;
  detayYolu: string;
}

function IcerikKarti({ icerik, detayYolu }: Props) {
  const kapakResmi = icerik.resimUrlleri[0];

  return (
    <Link to={detayYolu} className="content-card">
      <div className="content-card__media">
        {kapakResmi ? (
          <img src={resolveMediaUrl(kapakResmi)} alt="" loading="lazy" />
        ) : (
          <div className="content-card__media--placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="content-card__body">
        <span className="content-card__date">{tarihFormatla(icerik.yayinTarihi)}</span>
        <h3>{icerik.baslik}</h3>
        <p>{ozetCikar(icerik.icerik)}</p>
      </div>
    </Link>
  );
}

export default IcerikKarti;
