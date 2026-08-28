import { useEffect, useState } from 'react';
import { getAtikRehberi, updateAtikRehberiIcerik } from './api';
import type { AtikRehberiIcerik } from './types';
import TelefonOnizleme from './TelefonOnizleme';

interface Props {
  canManage: boolean;
}

function AtikRehberiPage({ canManage }: Props) {
  const [items, setItems] = useState<AtikRehberiIcerik[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingTur, setSavingTur] = useState<string | null>(null);
  const [onizlemeTur, setOnizlemeTur] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAtikRehberi();
      setItems(data);
      setDrafts(Object.fromEntries(data.map((k) => [k.tur, k.aciklama])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İçerik yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(tur: string) {
    setSavingTur(tur);
    setError(null);
    try {
      const updated = await updateAtikRehberiIcerik(tur, drafts[tur] ?? '');
      setItems((prev) => prev.map((k) => (k.tur === tur ? updated : k)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İçerik kaydedilemedi');
    } finally {
      setSavingTur(null);
    }
  }

  return (
    <div className="page">
      <h2>Atık Rehberi</h2>
      <p>
        Mobil uygulamadaki "Hizmetler / Atık Rehberi" ekranında, bir atık
        türü seçilip atık konumlarına gidildiğinde üstte gösterilen rehber
        metnini buradan yönetin. Atık türü listesi sabittir; sadece açıklama
        metni girilir/güncellenir.
      </p>
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <div className="guncel-sayfa-govde">
        <div className="guncel-sol">
          <div className="atik-rehberi-list">
            {items.map((item) => (
              <div className="atik-rehberi-item" key={item.tur}>
                <label>
                  {item.tur}
                  <textarea
                    value={drafts[item.tur] ?? ''}
                    onChange={(e) =>
                      setDrafts({ ...drafts, [item.tur]: e.target.value })
                    }
                    onFocus={() => setOnizlemeTur(item.tur)}
                    placeholder="Bu atık türü için rehber metni girin"
                    rows={3}
                    disabled={!canManage}
                  />
                </label>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleSave(item.tur)}
                    disabled={savingTur === item.tur}
                  >
                    Kaydet
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="guncel-sag">
          <h3 className="bolum-baslik">Mobil Uygulamadaki Görüntüsü</h3>
          {items.length > 0 && (
            <TelefonOnizleme baslik="Atık Rehberi">
              <div className="genel-onizleme-bolum">
                <span className="genel-onizleme-bolum-baslik">
                  {onizlemeTur ?? items[0].tur}
                </span>
                {drafts[onizlemeTur ?? items[0].tur] ? (
                  <p>{drafts[onizlemeTur ?? items[0].tur]}</p>
                ) : (
                  <span className="genel-onizleme-bos">Henüz içerik yok</span>
                )}
              </div>
            </TelefonOnizleme>
          )}
        </div>
        </div>
      )}
    </div>
  );
}

export default AtikRehberiPage;
