import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getBaskan, updateBaskan } from './api';
import type { BaskanInput } from './api';
import MedyaSecici from './MedyaSecici';

interface Props {
  canManage: boolean;
}

const emptyForm: BaskanInput = {
  ad: '',
  photoUrl: '',
  introText: '',
  maddeler: [],
  kapanisText: '',
};

function BaskanPage({ canManage }: Props) {
  const [form, setForm] = useState<BaskanInput>(emptyForm);
  const [maddelerText, setMaddelerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getBaskan();
      setForm({
        ad: data.ad,
        photoUrl: data.photoUrl ?? '',
        introText: data.introText,
        maddeler: data.maddeler,
        kapanisText: data.kapanisText,
      });
      setMaddelerText(data.maddeler.join('\n'));
      setUpdatedBy(data.updatedBy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başkan bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const maddeler = maddelerText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const updated = await updateBaskan({ ...form, photoUrl: form.photoUrl || null, maddeler });
      setUpdatedBy(updated.updatedBy);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    }
  }

  if (loading) return <div className="page"><p>Yükleniyor...</p></div>;

  return (
    <div className="page">
      <h2>Başkanımız</h2>
      <p>Mobil uygulamadaki "Başkanımız" ekranının içeriğini buradan yönetin.</p>
      {error && <p className="error-message">{error}</p>}
      {saved && !error && <p className="success-message">Kaydedildi.</p>}

      <form className="inline-form" onSubmit={handleSubmit}>
        <label>
          Ad Soyad
          <input
            value={form.ad}
            onChange={(e) => setForm({ ...form, ad: e.target.value })}
            disabled={!canManage}
            required
          />
        </label>
        <label>
          Fotoğraf URL
          <MedyaSecici
            value={form.photoUrl ?? ''}
            onChange={(url) => setForm({ ...form, photoUrl: url })}
            disabled={!canManage}
          />
        </label>
        <label>
          Giriş Metni
          <textarea
            value={form.introText}
            onChange={(e) => setForm({ ...form, introText: e.target.value })}
            disabled={!canManage}
          />
        </label>
        <label>
          Özgeçmiş Maddeleri (her satır bir madde)
          <textarea
            value={maddelerText}
            onChange={(e) => setMaddelerText(e.target.value)}
            disabled={!canManage}
            rows={6}
          />
        </label>
        <label>
          Kapanış Metni
          <textarea
            value={form.kapanisText}
            onChange={(e) => setForm({ ...form, kapanisText: e.target.value })}
            disabled={!canManage}
          />
        </label>
        {canManage && <button type="submit">Kaydet</button>}
        {updatedBy && <p className="map-editor-readonly-note">Son güncelleyen: {updatedBy}</p>}
      </form>
    </div>
  );
}

export default BaskanPage;
