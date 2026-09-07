import { useState } from 'react';
import type { FormEvent } from 'react';
import { sendManualNotification } from './api';

interface Props {
  canManage: boolean;
}

// Backend'deki ICERIK_BILDIRIM_KATEGORILERI ile birebir ayni (bkz.
// backend/src/modules/notifications/notification-categories.ts) - sistem
// kategorileri (talepDurumu/basvuruDurumu/randevu) burada gosterilmiyor,
// onlar zaten ilgili durum degisikliginde otomatik gonderiliyor. 'guncel'
// bir RBAC resource'u olmadigi icin etiketi burada literal olarak yaziliyor.
const ICERIK_BILDIRIM_KATEGORILERI = ['guncel'];

function NotificationsPage({ canManage }: Props) {
  const [baslik, setBaslik] = useState('');
  const [govde, setGovde] = useState('');
  const [kategoriler, setKategoriler] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function toggleKategori(kategori: string) {
    setKategoriler((prev) =>
      prev.includes(kategori) ? prev.filter((k) => k !== kategori) : [...prev, kategori],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    if (kategoriler.length === 0) {
      setError('Lütfen en az bir kategori seçin');
      return;
    }
    setSending(true);
    try {
      await sendManualNotification(baslik, govde, kategoriler);
      setBaslik('');
      setGovde('');
      setKategoriler([]);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirim gönderilemedi');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page">
      <h2>Bildirim Gönder</h2>
      <p>Seçilen kategorilerdeki tüm mobil uygulama kullanıcılarına anlık bildirim gönderin.</p>
      {error && <p className="error-message">{error}</p>}
      {sent && !error && <p className="success-message">Bildirim gönderildi.</p>}

      <div className="guncel-sayfa-govde">
        <div className="guncel-sol">
          <form className="inline-form" onSubmit={handleSubmit}>
            <label>
              Başlık
              <input
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                disabled={!canManage}
                placeholder="Lütfen veri girişi yapınız"
                required
              />
            </label>
            <label>
              Gövde
              <textarea
                value={govde}
                onChange={(e) => setGovde(e.target.value)}
                disabled={!canManage}
                placeholder="Lütfen veri girişi yapınız"
                required
              />
            </label>
            <label>Hedef Kategoriler</label>
            {ICERIK_BILDIRIM_KATEGORILERI.map((kategori) => (
              <label key={kategori} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={kategoriler.includes(kategori)}
                  onChange={() => toggleKategori(kategori)}
                  disabled={!canManage}
                />
                {kategori === 'guncel' ? 'Güncel' : kategori}
              </label>
            ))}
            {canManage && (
              <button type="submit" disabled={sending}>
                {sending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
