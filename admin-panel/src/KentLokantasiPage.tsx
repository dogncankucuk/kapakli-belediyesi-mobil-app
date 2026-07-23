import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createGununMenusu, deleteGununMenusu, getGununMenuleri } from './api';
import type { GununMenusuInput } from './api';
import type { GununMenusu, MenuKalemi } from './types';

interface Props {
  canManage: boolean;
}

const emptyKalem: MenuKalemi = { ad: '', aciklama: '' };

function KentLokantasiPage({ canManage }: Props) {
  const [items, setItems] = useState<GununMenusu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tarih, setTarih] = useState('');
  const [fiyat, setFiyat] = useState(0);
  const [kalemler, setKalemler] = useState<MenuKalemi[]>([{ ...emptyKalem }]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getGununMenuleri());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Menüler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  function updateKalem(index: number, field: keyof MenuKalemi, value: string) {
    setKalemler((prev) =>
      prev.map((k, i) => (i === index ? { ...k, [field]: value } : k)),
    );
  }

  function removeKalem(index: number) {
    setKalemler((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const gecerliKalemler = kalemler.filter((k) => k.ad.trim() && k.aciklama.trim());
    if (gecerliKalemler.length === 0) {
      setError('En az bir menü kalemi girilmeli');
      return;
    }
    const data: GununMenusuInput = { tarih, kalemler: gecerliKalemler, fiyat };
    try {
      await createGununMenusu(data);
      setTarih('');
      setFiyat(0);
      setKalemler([{ ...emptyKalem }]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Menü oluşturulamadı');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu menü silinsin mi?')) return;
    setError(null);
    try {
      await deleteGununMenusu(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Menü silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Kent Lokantası - Günün Menüsü</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Menü</h3>
          <label>
            Tarih
            <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} required />
          </label>
          <label>
            Fiyat (₺)
            <input
              type="number"
              min={0}
              value={fiyat}
              onChange={(e) => setFiyat(Number(e.target.value))}
              required
            />
          </label>
          {kalemler.map((kalem, index) => (
            <div key={index} className="edit-row">
              <label>
                Kalem Adı
                <input
                  value={kalem.ad}
                  onChange={(e) => updateKalem(index, 'ad', e.target.value)}
                />
              </label>
              <label>
                Açıklama
                <input
                  value={kalem.aciklama}
                  onChange={(e) => updateKalem(index, 'aciklama', e.target.value)}
                />
              </label>
              {kalemler.length > 1 && (
                <button type="button" onClick={() => removeKalem(index)}>
                  Kaldır
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setKalemler((prev) => [...prev, { ...emptyKalem }])}>
            + Kalem Ekle
          </button>
          <button type="submit">Kaydet</button>
        </form>
      )}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Kalemler</th>
              <th>Fiyat</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.tarih.slice(0, 10)}</td>
                <td>{item.kalemler.map((k) => k.ad).join(', ')}</td>
                <td>₺{item.fiyat}</td>
                {canManage && (
                  <td className="row-actions">
                    <button type="button" onClick={() => handleDelete(item.id)}>
                      Sil
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default KentLokantasiPage;
