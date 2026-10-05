import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createMedyaKlasoru,
  deleteMedyaKlasoru,
  getDepartmanlar,
  getMedyaKlasorleri,
  me,
} from './api';
import type { Departman, MedyaKlasoru } from './types';

interface Props {
  seciliKlasorId: string | undefined;
  onSecim: (klasorId: string | undefined) => void;
  // Bir dosya yuklendikten/silindikten sonra klasor dosya sayilarinin
  // guncellenmesi icin - MedyaPage/MedyaSeciciModal bu sayaci arttirir.
  yenilemeSinyali?: number;
}

// Klasor olusturma/silme yetkisi ('medyaKlasorleri') genel medya yetkisinden
// ('medya') ayri ve daha dar - bu bilesen bu yuzden kendi yetkisini kendi
// oturumundan (auth/me) okur, cagirandan bir canManage prop'u beklemez.
// Onceki halde MedyaSecici.tsx bu prop'u hep true geciyordu - herhangi bir
// icerik sayfasindaki "Medyadan Sec" modalini acabilen herkes klasor
// olusturup silebiliyordu, bu bilesenin kendi yetkisini kendisi dogrulamasi
// bu sizintiyi da kokten kapatir (backend zaten ayrica RequirePermission ile
// korur, burasi sadece UI'i dogru yetkiye gore gosterir/gizler).
function MedyaKlasorListesi({
  seciliKlasorId,
  onSecim,
  yenilemeSinyali,
}: Props) {
  const [klasorler, setKlasorler] = useState<MedyaKlasoru[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formAcik, setFormAcik] = useState(false);
  const [yeniKlasorAdi, setYeniKlasorAdi] = useState('');
  const [seciliDepartmanlar, setSeciliDepartmanlar] = useState<Set<string>>(new Set());
  const [olusturuluyor, setOlusturuluyor] = useState(false);
  const [canManageKlasor, setCanManageKlasor] = useState(false);
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);

  useEffect(() => {
    load();
  }, [yenilemeSinyali]);

  useEffect(() => {
    me()
      .then((kullanici) => {
        const yetkili =
          kullanici.role.isFullAccess ||
          (kullanici.permissions['medyaKlasorleri'] ?? []).includes('manage');
        setCanManageKlasor(yetkili);
        if (yetkili) {
          getDepartmanlar()
            .then(setDepartmanlar)
            .catch(() => {});
        }
      })
      .catch(() => setCanManageKlasor(false));
  }, []);

  async function load() {
    try {
      setKlasorler(await getMedyaKlasorleri());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Klasörler yüklenemedi');
    }
  }

  function departmanToggle(id: string) {
    setSeciliDepartmanlar((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleKlasorOlustur(e: FormEvent) {
    e.preventDefault();
    const ad = yeniKlasorAdi.trim();
    if (!ad) return;
    setOlusturuluyor(true);
    setError(null);
    try {
      const klasor = await createMedyaKlasoru(ad, Array.from(seciliDepartmanlar));
      setYeniKlasorAdi('');
      setSeciliDepartmanlar(new Set());
      setFormAcik(false);
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
          {canManageKlasor && (
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

      {canManageKlasor && !formAcik && (
        <button
          type="button"
          className="medya-klasor-yeni-ac"
          onClick={() => setFormAcik(true)}
        >
          + Yeni Klasör Ekle
        </button>
      )}

      {canManageKlasor && formAcik && (
        <form className="medya-klasor-yeni" onSubmit={handleKlasorOlustur}>
          <input
            value={yeniKlasorAdi}
            onChange={(e) => setYeniKlasorAdi(e.target.value)}
            placeholder="Klasör adı"
            autoFocus
          />
          {departmanlar.length > 0 && (
            <div className="medya-klasor-rol-secimi">
              <span className="medya-klasor-rol-baslik">
                Bu klasörü hangi departmanlar görebilsin? (boş bırakılırsa herkes görür)
              </span>
              {departmanlar.map((departman) => (
                <label key={departman.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={seciliDepartmanlar.has(departman.id)}
                    onChange={() => departmanToggle(departman.id)}
                  />
                  {departman.ad}
                </label>
              ))}
            </div>
          )}
          <div className="row-actions">
            <button type="submit" disabled={olusturuluyor || !yeniKlasorAdi.trim()}>
              {olusturuluyor ? 'Ekleniyor...' : 'Ekle'}
            </button>
            <button
              type="button"
              className="btn-neutral"
              onClick={() => {
                setFormAcik(false);
                setYeniKlasorAdi('');
                setSeciliDepartmanlar(new Set());
              }}
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default MedyaKlasorListesi;
