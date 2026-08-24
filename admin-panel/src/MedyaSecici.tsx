import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { getMedyaDosyalari, uploadMedya } from './api';
import { dosyaUzantisi } from './medyaUzanti';
import type { MedyaDosyasi } from './types';

interface Props {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Bir "Resim URL"/"Dosya URL" text input'unun yanina "Medyadan Sec" butonu
// ekler - hem elle URL yapistirmaya hem de Medya Kutuphanesi'nden secmeye
// izin verir. URL yazan tum sayfalarda (Haberler/Ilanlar/Ihaleler/
// Makaleler/Baskan/Hakkimizda/Meclis Gundemleri/Duyurular) ayni bicimde
// kullanilir.
function MedyaSecici({ value, onChange, disabled, placeholder }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="medya-secici-row">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder ?? 'https://...'}
        />
        {!disabled && (
          <button type="button" onClick={() => setOpen(true)}>
            Medyadan Seç
          </button>
        )}
      </div>
      {open && (
        <MedyaSeciciModal
          onSelect={(url) => {
            onChange(url);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function MedyaSeciciModal({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [dosyalar, setDosyalar] = useState<MedyaDosyasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [arama, setArama] = useState('');
  const [uzantiFiltre, setUzantiFiltre] = useState('tumu');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  const mevcutUzantilar = useMemo(() => {
    const uzantilar = new Set(
      dosyalar.map((d) => dosyaUzantisi(d.orijinalAd)).filter(Boolean),
    );
    return Array.from(uzantilar).sort((a, b) => a.localeCompare(b, 'tr-TR'));
  }, [dosyalar]);

  const filtreliDosyalar = useMemo(() => {
    const aramaKucuk = arama.trim().toLocaleLowerCase('tr-TR');
    return dosyalar.filter((dosya) => {
      if (uzantiFiltre !== 'tumu' && dosyaUzantisi(dosya.orijinalAd) !== uzantiFiltre) {
        return false;
      }
      if (aramaKucuk && !dosya.orijinalAd.toLocaleLowerCase('tr-TR').includes(aramaKucuk)) {
        return false;
      }
      return true;
    });
  }, [dosyalar, arama, uzantiFiltre]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setDosyalar(await getMedyaDosyalari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Medya dosyaları yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setYukleniyor(true);
    setError(null);
    try {
      const dosya = await uploadMedya(file);
      onSelect(dosya.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dosya yüklenemedi');
    } finally {
      setYukleniyor(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="medya-modal-overlay" onClick={onClose}>
      <div className="medya-modal" onClick={(e) => e.stopPropagation()}>
        <div className="medya-modal-header">
          <h3>Medyadan Seç</h3>
          <button type="button" onClick={onClose}>
            Kapat
          </button>
        </div>

        <label>
          Yeni Dosya Yükle ve Seç
          <input type="file" ref={fileInputRef} onChange={handleFileChange} disabled={yukleniyor} />
        </label>
        {yukleniyor && <p>Yükleniyor...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && dosyalar.length > 0 && (
          <div className="medya-filtre-row">
            <input
              type="search"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Dosya adına göre ara..."
              className="medya-arama-input"
            />
            <select value={uzantiFiltre} onChange={(e) => setUzantiFiltre(e.target.value)}>
              <option value="tumu">Tüm Uzantılar</option>
              {mevcutUzantilar.map((uzanti) => (
                <option key={uzanti} value={uzanti}>
                  .{uzanti}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <p>Yükleniyor...</p>
        ) : dosyalar.length === 0 ? (
          <p>Henüz dosya yüklenmemiş.</p>
        ) : filtreliDosyalar.length === 0 ? (
          <p>Aramanızla eşleşen dosya bulunamadı.</p>
        ) : (
          <div className="medya-grid medya-modal-grid">
            {filtreliDosyalar.map((dosya) => (
              <button
                type="button"
                key={dosya.id}
                className="medya-card medya-card-select"
                onClick={() => onSelect(dosya.url)}
              >
                {dosya.mimeType.startsWith('image/') ? (
                  <img src={dosya.url} alt={dosya.orijinalAd} className="medya-thumb" />
                ) : (
                  <div className="medya-thumb medya-thumb-file">
                    {dosya.orijinalAd.split('.').pop()?.toUpperCase() ?? 'DOSYA'}
                  </div>
                )}
                <div className="medya-card-body">
                  <span className="medya-card-name" title={dosya.orijinalAd}>
                    {dosya.orijinalAd}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MedyaSecici;
