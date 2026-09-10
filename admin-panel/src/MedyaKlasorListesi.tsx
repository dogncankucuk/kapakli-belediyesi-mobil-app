import { useEffect, useState } from 'react';
import {
  createMedyaKlasoru,
  deleteMedyaKlasoru,
  getMedyaKlasorleri,
} from './api';
import type { MedyaKlasoru } from './types';

interface Props {
  seciliKlasorId: string | undefined;
  onSecim: (klasorId: string | undefined) => void;
  canManage: boolean;
  // Bir dosya yuklendikten/silindikten sonra klasor dosya sayilarinin
  // guncellenmesi icin - MedyaPage/MedyaSeciciModal bu sayaci arttirir.
  yenilemeSinyali?: number;
}

function MedyaKlasorListesi({
  seciliKlasorId,
  onSecim,
  canManage,
  yenilemeSinyali,
}: Props) {
  const [klasorler, setKlasorler] = useState<MedyaKlasoru[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [yeniKlasorAdi, setYeniKlasorAdi] = useState('');
  const [olusturuluyor, setOlusturuluyor] = useState(false);

  useEffect(() => {
    load();
  }, [yenilemeSinyali]);

  async function load() {
    try {
      setKlasorler(await getMedyaKlasorleri());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Klasörler yüklenemedi');
    }
  }

  async function handleKlasorOlustur() {
    const ad = yeniKlasorAdi.trim();
    if (!ad) return;
    setOlusturuluyor(true);
    setError(null);
    try {
      const klasor = await createMedyaKlasoru(ad);
      setYeniKlasorAdi('');
      await load();
      onSecim(klasor.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Klasör oluşturulamadı');
    } finally {
      setOlusturuluyor(false);
    }
  }

  async function handleKlasorSil(id: string) {
    if (!confirm('Bu klasör silinsin mi?')) return;
    setError(null);
    try {
      await deleteMedyaKlasoru(id);
      if (seciliKlasorId === id) onSecim(undefined);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Klasör silinemedi');
    }
  }

  return (
    <div className="medya-klasor-listesi">
      {error && <p className="error-message">{error}</p>}
      <button
        type="button"
        className={`medya-klasor-item${seciliKlasorId === undefined ? ' aktif' : ''}`}
        onClick={() => onSecim(undefined)}
      >
        📁 Tümü
      </button>
      <button
        type="button"
        className={`medya-klasor-item${seciliKlasorId === 'root' ? ' aktif' : ''}`}
        onClick={() => onSecim('root')}
      >
        📂 Genel
      </button>
      {klasorler.map((klasor) => (
        <div className="medya-klasor-row" key={klasor.id}>
          <button
            type="button"
            className={`medya-klasor-item${seciliKlasorId === klasor.id ? ' aktif' : ''}`}
            onClick={() => onSecim(klasor.id)}
          >
            📁 {klasor.ad} <span className="medya-klasor-sayi">{klasor.dosyaSayisi}</span>
          </button>
          {canManage && (
            <button
              type="button"
              className="medya-klasor-sil"
              title="Klasörü sil"
              onClick={() => handleKlasorSil(klasor.id)}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {canManage && (
        <div className="medya-klasor-yeni">
          <input
            value={yeniKlasorAdi}
            onChange={(e) => setYeniKlasorAdi(e.target.value)}
            placeholder="Yeni klasör adı"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleKlasorOlustur();
            }}
          />
          <button type="button" onClick={handleKlasorOlustur} disabled={olusturuluyor}>
            + Ekle
          </button>
        </div>
      )}
    </div>
  );
}

export default MedyaKlasorListesi;
