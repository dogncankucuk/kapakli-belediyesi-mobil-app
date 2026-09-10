import { useState } from 'react';
import type { FormEvent } from 'react';
import { sendManualNotification } from './api';
import MedyaSecici from './MedyaSecici';

interface Props {
  canManage: boolean;
}

function NotificationsPage({ canManage }: Props) {
  const [baslik, setBaslik] = useState('');
  const [govde, setGovde] = useState('');
  const [fotografUrl, setFotografUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    setSending(true);
    try {
      await sendManualNotification(baslik, govde, fotografUrl || undefined);
      setBaslik('');
      setGovde('');
      setFotografUrl('');
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
      <p>
        Bildirimleri açık olan tüm mobil uygulama kullanıcılarına anlık
        bildirim gönderin.
      </p>
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
            <label>
              Fotoğraf (opsiyonel)
              <MedyaSecici
                value={fotografUrl}
                onChange={setFotografUrl}
                disabled={!canManage}
              />
            </label>
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
