import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getHakkimizda, updateHakkimizda } from './api';
import type { HakkimizdaInput } from './api';
import MedyaSecici from './MedyaSecici';

interface Props {
  canManage: boolean;
}

const emptyForm: HakkimizdaInput = {
  baskanOzetMetni: '',
  tarihcePhotoUrl: '',
  tarihceParagraflari: [],
  kurulusYili: '',
  buyuksehirYili: '',
  nufus: '',
};

function HakkimizdaPage({ canManage }: Props) {
  const [form, setForm] = useState<HakkimizdaInput>(emptyForm);
  const [paragraflarText, setParagraflarText] = useState('');
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
      const data = await getHakkimizda();
      setForm({
        baskanOzetMetni: data.baskanOzetMetni,
        tarihcePhotoUrl: data.tarihcePhotoUrl ?? '',
        tarihceParagraflari: data.tarihceParagraflari,
        kurulusYili: data.kurulusYili,
        buyuksehirYili: data.buyuksehirYili,
        nufus: data.nufus,
      });
      setParagraflarText(data.tarihceParagraflari.join('\n\n'));
      setUpdatedBy(data.updatedBy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hakkımızda içeriği yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const tarihceParagraflari = paragraflarText
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
      const updated = await updateHakkimizda({
        ...form,
        tarihcePhotoUrl: form.tarihcePhotoUrl || null,
        tarihceParagraflari,
      });
      setUpdatedBy(updated.updatedBy);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    }
  }

  if (loading) return <div className="page"><p>Yükleniyor...</p></div>;

  return (
    <div className="page">
      <h2>Hakkımızda</h2>
      <p>Mobil uygulamadaki "Hakkımızda" ekranının içeriğini buradan yönetin.</p>
      {error && <p className="error-message">{error}</p>}
      {saved && !error && <p className="success-message">Kaydedildi.</p>}

      <form className="inline-form" onSubmit={handleSubmit}>
        <label>
          Başkan Özet Metni (Hakkımızda kartında görünür)
          <textarea
            value={form.baskanOzetMetni}
            onChange={(e) => setForm({ ...form, baskanOzetMetni: e.target.value })}
            disabled={!canManage}
          />
        </label>
        <label>
          Tarihçe Fotoğraf URL
          <MedyaSecici
            value={form.tarihcePhotoUrl ?? ''}
            onChange={(url) => setForm({ ...form, tarihcePhotoUrl: url })}
            disabled={!canManage}
          />
        </label>
        <label>
          Kapaklı'nın Tarihçesi (paragraflar arasına boş satır bırakın)
          <textarea
            value={paragraflarText}
            onChange={(e) => setParagraflarText(e.target.value)}
            disabled={!canManage}
            rows={8}
          />
        </label>
        <label>
          Kuruluş Yılı
          <input
            value={form.kurulusYili}
            onChange={(e) => setForm({ ...form, kurulusYili: e.target.value })}
            disabled={!canManage}
            placeholder="1986"
          />
        </label>
        <label>
          Büyükşehir Yılı
          <input
            value={form.buyuksehirYili}
            onChange={(e) => setForm({ ...form, buyuksehirYili: e.target.value })}
            disabled={!canManage}
            placeholder="2012"
          />
        </label>
        <label>
          Nüfus
          <input
            value={form.nufus}
            onChange={(e) => setForm({ ...form, nufus: e.target.value })}
            disabled={!canManage}
            placeholder="147.610"
          />
        </label>
        {canManage && <button type="submit">Kaydet</button>}
        {updatedBy && <p className="map-editor-readonly-note">Son güncelleyen: {updatedBy}</p>}
      </form>
    </div>
  );
}

export default HakkimizdaPage;
