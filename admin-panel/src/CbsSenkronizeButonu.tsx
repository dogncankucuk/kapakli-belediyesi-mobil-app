import { useState } from 'react';
import type { CbsSenkronizeSonucu } from './api';

interface Props {
  senkronizeEt: () => Promise<CbsSenkronizeSonucu>;
  onTamamlandi: () => void;
  etiket?: string;
}

function CbsSenkronizeButonu({ senkronizeEt, onTamamlandi, etiket = "CBS'ten Senkronize Et" }: Props) {
  const [calisiyor, setCalisiyor] = useState(false);
  const [sonuc, setSonuc] = useState<CbsSenkronizeSonucu | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  async function tikla() {
    setCalisiyor(true);
    setHata(null);
    setSonuc(null);
    try {
      const sonuc = await senkronizeEt();
      setSonuc(sonuc);
      onTamamlandi();
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Senkronizasyon başarısız oldu');
    } finally {
      setCalisiyor(false);
    }
  }

  return (
    <div className="cbs-senkronize">
      <button type="button" onClick={tikla} disabled={calisiyor}>
        {calisiyor ? 'Senkronize ediliyor...' : etiket}
      </button>
      {sonuc && (
        <span className="cbs-senkronize-sonuc">
          {sonuc.bulunan} kayıt bulundu, {sonuc.eklenen} eklendi, {sonuc.guncellenen} güncellendi.
        </span>
      )}
      {hata && <span className="error-message">{hata}</span>}
    </div>
  );
}

export default CbsSenkronizeButonu;
