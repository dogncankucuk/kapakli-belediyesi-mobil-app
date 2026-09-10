interface Props {
  eyebrow: string;
  baslik: string;
  aciklama?: string;
}

function SayfaBasligi({ eyebrow, baslik, aciklama }: Props) {
  return (
    <div className="page-hero">
      <div className="container">
        <span className="eyebrow eyebrow--light">{eyebrow}</span>
        <h1>{baslik}</h1>
        {aciklama && <p className="page-hero__desc">{aciklama}</p>}
      </div>
    </div>
  );
}

export default SayfaBasligi;
