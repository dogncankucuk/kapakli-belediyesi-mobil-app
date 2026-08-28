import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createFormBelgesi,
  deleteFormBelgesi,
  getFormlar,
  updateFormBelgesi,
} from './api';
import type { FormBelgesiInput } from './api';
import MedyaSecici from './MedyaSecici';
import { BelgeKartiOnizleme, OnizlemeBosMetin, TelefonOnizleme } from './MobilOnizleme';
import type { FormBelgesi } from './types';
import { formBelgesiTuruLabels } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: FormBelgesiInput = {
  baslik: '',
  url: '',
  tur: 'belge',
};

function FormlarPage({ canManage }: Props) {
  const [items, setItems] = useState<FormBelgesi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormBelgesiInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormBelgesiInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getFormlar());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Formlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createFormBelgesi(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Form oluşturulamadı');
    }
  }

  function startEdit(item: FormBelgesi) {
    setEditingId(item.id);
    setEditForm({ baslik: item.baslik, url: item.url, tur: item.tur });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateFormBelgesi(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Form güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu form/belge kaydı silinsin mi?')) return;
    setError(null);
    try {
      await deleteFormBelgesi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Form silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Formlar ve Dilekçeler</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      {canManage && <h3 className="bolum-baslik">1. Bölüm: Ekleme</h3>}
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
            Bağlantı (URL)
            <MedyaSecici
              value={form.url}
              onChange={(url) => setForm({ ...form, url })}
            />
          </label>
          <label>
            Tür
            <select value={form.tur} onChange={(e) => setForm({ ...form, tur: e.target.value })}>
              {Object.entries(formBelgesiTuruLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
              <th>Başlık</th>
              <th>Tür</th>
              <th>URL</th>
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
                        Bağlantı (URL)
                        <MedyaSecici
                          value={editForm.url}
                          onChange={(url) => setEditForm({ ...editForm, url })}
                        />
                      </label>
                      <label>
                        Tür
                        <select
                          value={editForm.tur}
                          onChange={(e) => setEditForm({ ...editForm, tur: e.target.value })}
                        >
                          {Object.entries(formBelgesiTuruLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
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
                  <td>{formBelgesiTuruLabels[item.tur as keyof typeof formBelgesiTuruLabels] ?? item.tur}</td>
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
        <TelefonOnizleme baslik="Formlar ve Dilekçeler">
          {items.length === 0 && <OnizlemeBosMetin>İçerik bulunamadı.</OnizlemeBosMetin>}
          {items.map((item) => (
            <BelgeKartiOnizleme key={item.id} baslik={item.baslik} dosyaVarMi={!!item.url} />
          ))}
        </TelefonOnizleme>
      </div>
      </div>
    </div>
  );
}

export default FormlarPage;
