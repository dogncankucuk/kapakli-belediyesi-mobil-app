import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createFaturaOdemeKurumu,
  deleteFaturaOdemeKurumu,
  getFaturaOdemeKurumlari,
  updateFaturaOdemeKurumu,
} from './api';
import type { FaturaOdemeKurumuInput } from './api';
import type { FaturaOdemeKurumu } from './types';
import TelefonOnizleme from './TelefonOnizleme';

interface Props {
  canManage: boolean;
}

const emptyForm: FaturaOdemeKurumuInput = {
  ad: '',
  aciklama: '',
  url: '',
};

function FaturaOdemePage({ canManage }: Props) {
  const [items, setItems] = useState<FaturaOdemeKurumu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FaturaOdemeKurumuInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FaturaOdemeKurumuInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getFaturaOdemeKurumlari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kurumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createFaturaOdemeKurumu(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kurum oluşturulamadı');
    }
  }

  function startEdit(item: FaturaOdemeKurumu) {
    setEditingId(item.id);
    setEditForm({ ad: item.ad, aciklama: item.aciklama, url: item.url });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateFaturaOdemeKurumu(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kurum güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu kurum silinsin mi?')) return;
    setError(null);
    try {
      await deleteFaturaOdemeKurumu(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kurum silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Fatura Ödeme</h2>
      <p>
        Mobil uygulamadaki "Fatura Ödeme" ekranında listelenen kurum
        bağlantılarını buradan yönetin (ör. TESKİ, GAZDAŞ, TREPAŞ).
      </p>
      {error && <p className="error-message">{error}</p>}

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      {canManage && <h3 className="bolum-baslik">1. Bölüm: Ekleme</h3>}
      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Kurum</h3>
          <label>
            Kurum Adı
            <input
              value={form.ad}
              onChange={(e) => setForm({ ...form, ad: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Açıklama
            <input
              value={form.aciklama}
              onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Bağlantı (URL)
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <button type="submit">Kaydet</button>
        </form>
      )}

      <h3 className="bolum-baslik">2. Bölüm: Eklenmiş Kayıtlar</h3>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Kurum Adı</th>
              <th>Açıklama</th>
              <th>Bağlantı</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td colSpan={canManage ? 4 : 3}>
                    <div className="edit-row">
                      <label>
                        Kurum Adı
                        <input
                          value={editForm.ad}
                          onChange={(e) => setEditForm({ ...editForm, ad: e.target.value })}
                        />
                      </label>
                      <label>
                        Açıklama
                        <input
                          value={editForm.aciklama}
                          onChange={(e) =>
                            setEditForm({ ...editForm, aciklama: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Bağlantı (URL)
                        <input
                          value={editForm.url}
                          onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                        />
                      </label>
                      <div className="row-actions">
                        <button type="button" onClick={() => handleUpdate(item.id)}>
                          Kaydet
                        </button>
                        <button type="button" onClick={() => setEditingId(null)}>
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td>{item.ad}</td>
                  <td>{item.aciklama}</td>
                  <td>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.url}
                    </a>
                  </td>
                  {canManage && (
                    <td className="row-actions">
                      <button type="button" onClick={() => startEdit(item)}>
                        Düzenle
                      </button>
                      <button type="button" onClick={() => handleDelete(item.id)}>
                        Sil
                      </button>
                    </td>
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
      </div>

      <div className="guncel-sag">
        <h3 className="bolum-baslik">3. Bölüm: Mobil Uygulamadaki Görüntüsü</h3>
        <TelefonOnizleme baslik="Fatura Ödeme">
          {items.length === 0 && (
            <span className="genel-onizleme-bos">Henüz kurum eklenmemiş</span>
          )}
          {items.map((item) => (
            <div className="genel-onizleme-bolum" key={item.id}>
              <span className="genel-onizleme-bolum-baslik">{item.ad || 'Kurum Adı'}</span>
              <div className="genel-onizleme-satir">
                <span className="genel-onizleme-satir-ipucu">{item.aciklama || 'Açıklama'}</span>
              </div>
            </div>
          ))}
        </TelefonOnizleme>
      </div>
      </div>
    </div>
  );
}

export default FaturaOdemePage;
