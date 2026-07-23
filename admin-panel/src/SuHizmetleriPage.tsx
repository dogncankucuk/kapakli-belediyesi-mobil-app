import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createBaraj,
  createPlanliKesinti,
  deleteBaraj,
  deletePlanliKesinti,
  getBarajlar,
  getPlanliKesintiler,
  updateBaraj,
  updatePlanliKesinti,
} from './api';
import type { BarajInput, PlanliKesintiInput } from './api';
import type { Baraj, PlanliKesinti } from './types';

interface Props {
  canManage: boolean;
}

const emptyBarajForm: BarajInput = { ad: '', doluluk: 0 };
const emptyKesintiForm: PlanliKesintiInput = { tarih: '', ilce: '', aciklama: '' };

function SuHizmetleriPage({ canManage }: Props) {
  const [barajlar, setBarajlar] = useState<Baraj[]>([]);
  const [kesintiler, setKesintiler] = useState<PlanliKesinti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [barajForm, setBarajForm] = useState<BarajInput>(emptyBarajForm);
  const [editingBarajId, setEditingBarajId] = useState<string | null>(null);
  const [editBarajForm, setEditBarajForm] = useState<BarajInput>(emptyBarajForm);

  const [kesintiForm, setKesintiForm] = useState<PlanliKesintiInput>(emptyKesintiForm);
  const [editingKesintiId, setEditingKesintiId] = useState<string | null>(null);
  const [editKesintiForm, setEditKesintiForm] = useState<PlanliKesintiInput>(emptyKesintiForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [b, k] = await Promise.all([getBarajlar(), getPlanliKesintiler()]);
      setBarajlar(b);
      setKesintiler(k);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBaraj(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createBaraj(barajForm);
      setBarajForm(emptyBarajForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Baraj oluşturulamadı');
    }
  }

  async function handleUpdateBaraj(id: string) {
    setError(null);
    try {
      await updateBaraj(id, editBarajForm);
      setEditingBarajId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Baraj güncellenemedi');
    }
  }

  async function handleDeleteBaraj(id: string) {
    if (!confirm('Bu baraj silinsin mi?')) return;
    setError(null);
    try {
      await deleteBaraj(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Baraj silinemedi');
    }
  }

  async function handleCreateKesinti(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPlanliKesinti(kesintiForm);
      setKesintiForm(emptyKesintiForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesinti oluşturulamadı');
    }
  }

  async function handleUpdateKesinti(id: string) {
    setError(null);
    try {
      await updatePlanliKesinti(id, editKesintiForm);
      setEditingKesintiId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesinti güncellenemedi');
    }
  }

  async function handleDeleteKesinti(id: string) {
    if (!confirm('Bu kesinti kaydı silinsin mi?')) return;
    setError(null);
    try {
      await deletePlanliKesinti(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesinti silinemedi');
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h2>Su Hizmetleri</h2>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Su Hizmetleri</h2>
      {error && <p className="error-message">{error}</p>}

      <h3>Baraj Doluluk</h3>
      {canManage && (
        <form className="inline-form" onSubmit={handleCreateBaraj}>
          <label>
            Baraj Adı
            <input
              value={barajForm.ad}
              onChange={(e) => setBarajForm({ ...barajForm, ad: e.target.value })}
              required
            />
          </label>
          <label>
            Doluluk (%)
            <input
              type="number"
              min={0}
              max={100}
              value={barajForm.doluluk}
              onChange={(e) => setBarajForm({ ...barajForm, doluluk: Number(e.target.value) })}
              required
            />
          </label>
          <button type="submit">Kaydet</button>
        </form>
      )}
      <table>
        <thead>
          <tr>
            <th>Ad</th>
            <th>Doluluk</th>
            {canManage && <th>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {barajlar.map((item) =>
            editingBarajId === item.id ? (
              <tr key={item.id}>
                <td colSpan={canManage ? 3 : 2}>
                  <div className="edit-row">
                    <label>
                      Ad
                      <input
                        value={editBarajForm.ad}
                        onChange={(e) => setEditBarajForm({ ...editBarajForm, ad: e.target.value })}
                      />
                    </label>
                    <label>
                      Doluluk (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editBarajForm.doluluk}
                        onChange={(e) =>
                          setEditBarajForm({ ...editBarajForm, doluluk: Number(e.target.value) })
                        }
                      />
                    </label>
                    <div className="row-actions">
                      <button type="button" onClick={() => handleUpdateBaraj(item.id)}>
                        Kaydet
                      </button>
                      <button type="button" onClick={() => setEditingBarajId(null)}>
                        Vazgeç
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td>{item.ad}</td>
                <td>%{item.doluluk}</td>
                {canManage && (
                  <td className="row-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBarajId(item.id);
                        setEditBarajForm({ ad: item.ad, doluluk: item.doluluk });
                      }}
                    >
                      Düzenle
                    </button>
                    <button type="button" onClick={() => handleDeleteBaraj(item.id)}>
                      Sil
                    </button>
                  </td>
                )}
              </tr>
            ),
          )}
        </tbody>
      </table>

      <h3>Planlı Kesintiler</h3>
      {canManage && (
        <form className="inline-form" onSubmit={handleCreateKesinti}>
          <label>
            Tarih
            <input
              type="date"
              value={kesintiForm.tarih}
              onChange={(e) => setKesintiForm({ ...kesintiForm, tarih: e.target.value })}
              required
            />
          </label>
          <label>
            İlçe / Mahalle
            <input
              value={kesintiForm.ilce}
              onChange={(e) => setKesintiForm({ ...kesintiForm, ilce: e.target.value })}
              required
            />
          </label>
          <label>
            Açıklama
            <input
              value={kesintiForm.aciklama}
              onChange={(e) => setKesintiForm({ ...kesintiForm, aciklama: e.target.value })}
              required
            />
          </label>
          <button type="submit">Kaydet</button>
        </form>
      )}
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>İlçe</th>
            <th>Açıklama</th>
            {canManage && <th>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {kesintiler.map((item) =>
            editingKesintiId === item.id ? (
              <tr key={item.id}>
                <td colSpan={canManage ? 4 : 3}>
                  <div className="edit-row">
                    <label>
                      Tarih
                      <input
                        type="date"
                        value={editKesintiForm.tarih}
                        onChange={(e) =>
                          setEditKesintiForm({ ...editKesintiForm, tarih: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      İlçe / Mahalle
                      <input
                        value={editKesintiForm.ilce}
                        onChange={(e) =>
                          setEditKesintiForm({ ...editKesintiForm, ilce: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Açıklama
                      <input
                        value={editKesintiForm.aciklama}
                        onChange={(e) =>
                          setEditKesintiForm({ ...editKesintiForm, aciklama: e.target.value })
                        }
                      />
                    </label>
                    <div className="row-actions">
                      <button type="button" onClick={() => handleUpdateKesinti(item.id)}>
                        Kaydet
                      </button>
                      <button type="button" onClick={() => setEditingKesintiId(null)}>
                        Vazgeç
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td>{item.tarih.slice(0, 10)}</td>
                <td>{item.ilce}</td>
                <td>{item.aciklama}</td>
                {canManage && (
                  <td className="row-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKesintiId(item.id);
                        setEditKesintiForm({
                          tarih: item.tarih.slice(0, 10),
                          ilce: item.ilce,
                          aciklama: item.aciklama,
                        });
                      }}
                    >
                      Düzenle
                    </button>
                    <button type="button" onClick={() => handleDeleteKesinti(item.id)}>
                      Sil
                    </button>
                  </td>
                )}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SuHizmetleriPage;
