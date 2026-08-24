import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { deleteMedya, getMedyaDosyalari, uploadMedya } from './api';
import type { MedyaDosyasi } from './types';

interface Props {
  canManage: boolean;
}

function boyutFormatla(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function tarihFormatla(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function MedyaPage({ canManage }: Props) {
  const [dosyalar, setDosyalar] = useState<MedyaDosyasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kopyalananId, setKopyalananId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

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
      await uploadMedya(file);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dosya yüklenemedi');
    } finally {
      setYukleniyor(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu dosya silinsin mi? Bu dosyayı kullanan içerikler bozulabilir.')) return;
    setError(null);
    try {
      await deleteMedya(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dosya silinemedi');
    }
  }

  async function handleCopy(dosya: MedyaDosyasi) {
    const tamUrl = `${window.location.origin}${dosya.url}`;
    try {
      await navigator.clipboard.writeText(tamUrl);
      setKopyalananId(dosya.id);
      setTimeout(() => setKopyalananId(null), 1500);
    } catch {
      setError('Bağlantı kopyalanamadı, tarayıcınız panoya erişime izin vermiyor olabilir');
    }
  }

  return (
    <div className="page">
      <h2>Medya Kütüphanesi</h2>
      <p>
        Bu siteye yüklenen tüm dosyalar burada saklanır. Bir dosyayı
        yükledikten sonra bağlantısını kopyalayıp herhangi bir "Resim URL" /
        "Dosya URL" alanına yapıştırarak kullanabilirsiniz.
      </p>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <div className="inline-form">
          <label>
            Dosya Yükle
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              disabled={yukleniyor}
            />
          </label>
          {yukleniyor && <p>Yükleniyor...</p>}
        </div>
      )}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : dosyalar.length === 0 ? (
        <p>Henüz dosya yüklenmemiş.</p>
      ) : (
        <div className="medya-grid">
          {dosyalar.map((dosya) => (
            <div className="medya-card" key={dosya.id}>
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
                <span className="medya-card-meta">
                  {boyutFormatla(dosya.boyut)} · {tarihFormatla(dosya.createdAt)}
                </span>
                <div className="row-actions">
                  <button type="button" onClick={() => handleCopy(dosya)}>
                    {kopyalananId === dosya.id ? 'Kopyalandı!' : "URL'yi Kopyala"}
                  </button>
                  {canManage && (
                    <button type="button" onClick={() => handleDelete(dosya.id)}>
                      Sil
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedyaPage;
