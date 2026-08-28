import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createBasvuruHizmeti,
  deleteBasvuruHizmeti,
  getBasvuruHizmetleri,
  updateBasvuruHizmeti,
} from './api';
import type { BasvuruHizmetiInput } from './api';
import type { BasvuruHizmeti } from './types';
import { basvuruTuruLabels } from './types';

interface Props {
  canManage: boolean;
}

// Textarea'larda hizmetler/kosullar listeleri satir satir girilir.
function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const emptyForm: BasvuruHizmetiInput = {
  baslik: '',
  ozet: '',
  hizmetler: [],
  kosullar: [],
  calismaSaatleri: '',
  sorumluBirim: '',
  basvuruTuru: 'telefon',
  basvuruDegeri: '',
};

type FormState = Omit<BasvuruHizmetiInput, 'hizmetler' | 'kosullar'> & {
  hizmetlerText: string;
  kosullarText: string;
};

const emptyFormState: FormState = {
  ...emptyForm,
  hizmetlerText: '',
  kosullarText: '',
};

function toInput(state: FormState): BasvuruHizmetiInput {
  return {
    baslik: state.baslik,
    ozet: state.ozet,
    hizmetler: linesToArray(state.hizmetlerText),
    kosullar: linesToArray(state.kosullarText),
    calismaSaatleri: state.calismaSaatleri,
    sorumluBirim: state.sorumluBirim,
    basvuruTuru: state.basvuruTuru,
    basvuruDegeri: state.basvuruDegeri,
  };
}

function toFormState(item: BasvuruHizmeti): FormState {
  return {
    baslik: item.baslik,
    ozet: item.ozet,
    hizmetlerText: item.hizmetler.join('\n'),
    kosullarText: item.kosullar.join('\n'),
    calismaSaatleri: item.calismaSaatleri ?? '',
    sorumluBirim: item.sorumluBirim ?? '',
    basvuruTuru: item.basvuruTuru,
    basvuruDegeri: item.basvuruDegeri,
  };
}

function BasvuruHizmetleriPage({ canManage }: Props) {
  const [items, setItems] = useState<BasvuruHizmeti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyFormState);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getBasvuruHizmetleri());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru hizmetleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createBasvuruHizmeti(toInput(form));
      setForm(emptyFormState);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru hizmeti oluşturulamadı');
    }
  }

  function startEdit(item: BasvuruHizmeti) {
    setEditingId(item.id);
    setEditForm(toFormState(item));
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateBasvuruHizmeti(id, toInput(editForm));
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru hizmeti güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu başvuru hizmeti silinsin mi?')) return;
    setError(null);
    try {
      await deleteBasvuruHizmeti(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru hizmeti silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Başvuru Hizmetleri</h2>
      <p>
        "Engelli ve Yaşlı Hizmetleri" ekranında vatandaşa gösterilen, başvuru
        yapılabilen hizmet kartları.
      </p>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Kayıt</h3>
          <label>
            Başlık
            <input
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Özet
            <input
              value={form.ozet}
              onChange={(e) => setForm({ ...form, ozet: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Sağlanan Hizmetler (her satıra bir tane)
            <textarea
              rows={3}
              value={form.hizmetlerText}
              onChange={(e) => setForm({ ...form, hizmetlerText: e.target.value })}
            />
          </label>
          <label>
            Başvuru Şartları (her satıra bir tane)
            <textarea
              rows={3}
              value={form.kosullarText}
              onChange={(e) => setForm({ ...form, kosullarText: e.target.value })}
            />
          </label>
          <label>
            Çalışma Saatleri
            <input
              value={form.calismaSaatleri}
              onChange={(e) => setForm({ ...form, calismaSaatleri: e.target.value })}
            />
          </label>
          <label>
            Sorumlu Birim
            <input
              value={form.sorumluBirim}
              onChange={(e) => setForm({ ...form, sorumluBirim: e.target.value })}
            />
          </label>
          <label>
            Başvuru Şekli
            <select
              value={form.basvuruTuru}
              onChange={(e) => setForm({ ...form, basvuruTuru: e.target.value })}
            >
              {Object.entries(basvuruTuruLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {form.basvuruTuru === 'link' ? 'Başvuru Linki' : 'Başvuru Telefonu'}
            <input
              value={form.basvuruDegeri}
              onChange={(e) => setForm({ ...form, basvuruDegeri: e.target.value })}
              placeholder={form.basvuruTuru === 'link' ? 'https://...' : '4448059'}
              required
            />
          </label>
          <button type="submit">Kaydet</button>
        </form>
      )}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Özet</th>
              <th>Başvuru Şekli</th>
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
                        Başlık
                        <input
                          value={editForm.baslik}
                          onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                        />
                      </label>
                      <label>
                        Özet
                        <input
                          value={editForm.ozet}
                          onChange={(e) => setEditForm({ ...editForm, ozet: e.target.value })}
                        />
                      </label>
                      <label>
                        Sağlanan Hizmetler (her satıra bir tane)
                        <textarea
                          rows={3}
                          value={editForm.hizmetlerText}
                          onChange={(e) =>
                            setEditForm({ ...editForm, hizmetlerText: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Başvuru Şartları (her satıra bir tane)
                        <textarea
                          rows={3}
                          value={editForm.kosullarText}
                          onChange={(e) =>
                            setEditForm({ ...editForm, kosullarText: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Çalışma Saatleri
                        <input
                          value={editForm.calismaSaatleri}
                          onChange={(e) =>
                            setEditForm({ ...editForm, calismaSaatleri: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Sorumlu Birim
                        <input
                          value={editForm.sorumluBirim}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sorumluBirim: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Başvuru Şekli
                        <select
                          value={editForm.basvuruTuru}
                          onChange={(e) =>
                            setEditForm({ ...editForm, basvuruTuru: e.target.value })
                          }
                        >
                          {Object.entries(basvuruTuruLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {editForm.basvuruTuru === 'link' ? 'Başvuru Linki' : 'Başvuru Telefonu'}
                        <input
                          value={editForm.basvuruDegeri}
                          onChange={(e) =>
                            setEditForm({ ...editForm, basvuruDegeri: e.target.value })
                          }
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
                  <td>{item.baslik}</td>
                  <td>{item.ozet}</td>
                  <td>
                    {basvuruTuruLabels[item.basvuruTuru as keyof typeof basvuruTuruLabels] ??
                      item.basvuruTuru}{' '}
                    ({item.basvuruDegeri})
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
  );
}

export default BasvuruHizmetleriPage;
