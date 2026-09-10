interface Props {
  yukleniyor: boolean;
  hata: string | null;
  bosMesaji?: string;
  bos?: boolean;
}

function DurumMesaji({ yukleniyor, hata, bosMesaji, bos }: Props) {
  if (yukleniyor) {
    return <p className="state-message">Yükleniyor...</p>;
  }
  if (hata) {
    return <p className="state-message state-message--error">{hata}</p>;
  }
  if (bos) {
    return <p className="state-message">{bosMesaji ?? "Kayıt bulunamadı."}</p>;
  }
  return null;
}

export default DurumMesaji;
