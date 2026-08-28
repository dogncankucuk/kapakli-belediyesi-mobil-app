import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createUlasimHatti,
  deleteUlasimHatti,
  getUlasimHatlari,
  updateUlasimHatti,
} from './api';
import type { UlasimHattiInput } from './api';
import TelefonOnizleme from './TelefonOnizleme';
import type { KalkisSaati, KalkisYonu, UlasimHatti } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: UlasimHattiInput = {
  hatAdi: '',
  hatNumarasi: '',
  guzergah: '',
  canli: false,
  hatKodu: '',
  fiyatTam: '',
  fiyatIndirimli: '',
  kalkisSaatleri: [],
};

function ozetKalkis(kalkislar: KalkisSaati[]): string {
  if (kalkislar.length === 0) return '-';
  const gidis = kalkislar
    .filter((k) => k.yon === 'gidis')
    .map((k) => k.saat)
    .sort()
    .join(', ');
  const donus = kalkislar
    .filter((k) => k.yon === 'donus')
    .map((k) => k.saat)
    .sort()
    .join(', ');
  const parcalar: string[] = [];
  if (gidis) parcalar.push(`Gidiş: ${gidis}`);
  if (donus) parcalar.push(`Dönüş: ${donus}`);
  return parcalar.join(' · ') || '-';
}

interface KalkisSaatleriEditorProps {
  value: KalkisSaati[];
  onChange: (value: KalkisSaati[]) => void;
}

function KalkisSaatleriEditor({ value, onChange }: KalkisSaatleriEditorProps) {
  const [yeniSaat, setYeniSaat] = useState('');
  const [yeniYon, setYeniYon] = useState<KalkisYonu>('gidis');

  function ekle() {
    if (!yeniSaat) return;
    onChange([...value, { saat: yeniSaat, yon: yeniYon }]);
    setYeniSaat('');
  }

  function sil(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function yonDegistir(index: number) {
    onChange(
      value.map((k, i) =>
        i === index ? { ...k, yon: k.yon === 'gidis' ? 'donus' : 'gidis' } : k,
      ),
    );
  }

  const gruplar: { yon: KalkisYonu; baslik: string }[] = [
    { yon: 'gidis', baslik: 'Gidiş' },
    { yon: 'donus', baslik: 'Dönüş' },
  ];

  return (
    <div className="kalkis-editor">
      <div className="kalkis-ekle-satiri">
        <input
          type="time"
          value={yeniSaat}
          onChange={(e) => setYeniSaat(e.target.value)}
        />
        <select
          value={yeniYon}
          onChange={(e) => setYeniYon(e.target.value as KalkisYonu)}
        >
          <option value="gidis">Gidiş</option>
          <option value="donus">Dönüş</option>
        </select>
        <button type="button" onClick={ekle}>
          + Ekle
        </button>
      </div>
      {gruplar.map((grup) => {
        const kayitlar = value
          .map((k, index) => ({ ...k, index }))
          .filter((k) => k.yon === grup.yon);
        return (
          <div className="kalkis-grup" key={grup.yon}>
            <span className="kalkis-grup-baslik">{grup.baslik}</span>
            <div className="kalkis-chip-list">
              {kayitlar.length === 0 && (
                <span className="kalkis-bos">Henüz saat eklenmedi</span>
              )}
              {kayitlar.map((k) => (
                <span key={k.index} className={`kalkis-chip kalkis-chip-${k.yon}`}>
                  <button
                    type="button"
                    onClick={() => yonDegistir(k.index)}
                    title="Yönü değiştirmek için tıklayın"
                  >
                    {k.saat}
                  </button>
                  <button
                    type="button"
                    className="kalkis-chip-sil"
                    onClick={() => sil(k.index)}
                    aria-label="Sil"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UlasimHatlariPage({ canManage }: Props) {
  const [items, setItems] = useState<UlasimHatti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UlasimHattiInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UlasimHattiInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getUlasimHatlari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hatlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createUlasimHatti(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hat oluşturulamadı');
    }
  }

  function startEdit(item: UlasimHatti) {
    setEditingId(item.id);
    setEditForm({
      hatAdi: item.hatAdi,
      hatNumarasi: item.hatNumarasi ?? '',
      guzergah: item.guzergah,
      canli: item.canli,
      hatKodu: item.hatKodu ?? '',
      fiyatTam: item.fiyatTam ?? '',
      fiyatIndirimli: item.fiyatIndirimli ?? '',
      kalkisSaatleri: item.kalkisSaatleri,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateUlasimHatti(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hat güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu hat silinsin mi?')) return;
    setError(null);
    try {
      await deleteUlasimHatti(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hat silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Ulaşım Hizmetleri</h2>
      <p>
        Mobil uygulamadaki "Ulaşım" ekranında listelenen hatları buradan
        yönetin. "Canlı Takip" işaretli ve "Tekulaş Hat Kodu" girilmiş
        hatlarda mobil uygulama otobüslerin anlık konumunu gösterir.
      </p>
      {error && <p className="error-message">{error}</p>}

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      {canManage && <h3 className="bolum-baslik">1. Bölüm: Ekleme</h3>}
      {canManage && (
          <form className="inline-form" onSubmit={handleCreate}>
            <h3>Yeni Hat</h3>
            <label>
              Hat Adı
              <input
                value={form.hatAdi}
                onChange={(e) => setForm({ ...form, hatAdi: e.target.value })}
                placeholder="Lütfen veri girişi yapınız"
                required
              />
            </label>
            <label>
              Hat Numarası (opsiyonel)
              <input
                value={form.hatNumarasi}
                onChange={(e) => setForm({ ...form, hatNumarasi: e.target.value })}
                placeholder="Ör. 14"
              />
            </label>
            <label>
              Güzergah
              <input
                value={form.guzergah}
                onChange={(e) => setForm({ ...form, guzergah: e.target.value })}
                placeholder="Lütfen veri girişi yapınız"
                required
              />
            </label>
            <div className="fiyat-satiri">
              <label>
                Fiyat - Tam Kart (opsiyonel)
                <input
                  value={form.fiyatTam}
                  onChange={(e) => setForm({ ...form, fiyatTam: e.target.value })}
                  placeholder="Ör. 15 TL"
                />
              </label>
              <label>
                Fiyat - İndirimli Kart (opsiyonel)
                <input
                  value={form.fiyatIndirimli}
                  onChange={(e) =>
                    setForm({ ...form, fiyatIndirimli: e.target.value })
                  }
                  placeholder="Ör. 7,5 TL"
                />
              </label>
            </div>
            <label className="kalkis-label">
              Kalkış Saatleri (opsiyonel)
              <KalkisSaatleriEditor
                value={form.kalkisSaatleri ?? []}
                onChange={(kalkisSaatleri) => setForm({ ...form, kalkisSaatleri })}
              />
            </label>
            <div className="canli-takip-blok">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.canli}
                  onChange={(e) => setForm({ ...form, canli: e.target.checked })}
                />
                Canlı Takip
              </label>
              <label>
                Tekulaş Hat Kodu (opsiyonel)
                <input
                  value={form.hatKodu}
                  onChange={(e) => setForm({ ...form, hatKodu: e.target.value })}
                />
              </label>
              {form.canli && (
                <p className="canli-harita-notu">
                  🗺️ Canlı takip haritası (yakında): bu hat için otobüslerin
                  haritadaki anlık konumu ileride burada gösterilecek.
                </p>
              )}
            </div>
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
              <th>Hat Adı</th>
              <th>Hat Numarası</th>
              <th>Güzergah</th>
              <th>Canlı Takip</th>
              <th>Fiyat (Tam / İndirimli)</th>
              <th>Kalkış Saatleri</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td colSpan={canManage ? 7 : 6}>
                    <div className="edit-row">
                      <label>
                        Hat Adı
                        <input
                          value={editForm.hatAdi}
                          onChange={(e) =>
                            setEditForm({ ...editForm, hatAdi: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Hat Numarası (opsiyonel)
                        <input
                          value={editForm.hatNumarasi}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              hatNumarasi: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Güzergah
                        <input
                          value={editForm.guzergah}
                          onChange={(e) =>
                            setEditForm({ ...editForm, guzergah: e.target.value })
                          }
                        />
                      </label>
                      <div className="fiyat-satiri">
                        <label>
                          Fiyat - Tam Kart (opsiyonel)
                          <input
                            value={editForm.fiyatTam}
                            onChange={(e) =>
                              setEditForm({ ...editForm, fiyatTam: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Fiyat - İndirimli Kart (opsiyonel)
                          <input
                            value={editForm.fiyatIndirimli}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                fiyatIndirimli: e.target.value,
                              })
                            }
                          />
                        </label>
                      </div>
                      <label className="kalkis-label">
                        Kalkış Saatleri (opsiyonel)
                        <KalkisSaatleriEditor
                          value={editForm.kalkisSaatleri ?? []}
                          onChange={(kalkisSaatleri) =>
                            setEditForm({ ...editForm, kalkisSaatleri })
                          }
                        />
                      </label>
                      <div className="canli-takip-blok">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={editForm.canli}
                            onChange={(e) =>
                              setEditForm({ ...editForm, canli: e.target.checked })
                            }
                          />
                          Canlı Takip
                        </label>
                        <label>
                          Tekulaş Hat Kodu (opsiyonel)
                          <input
                            value={editForm.hatKodu}
                            onChange={(e) =>
                              setEditForm({ ...editForm, hatKodu: e.target.value })
                            }
                          />
                        </label>
                        {editForm.canli && (
                          <p className="canli-harita-notu">
                            🗺️ Canlı takip haritası (yakında): bu hat için
                            otobüslerin haritadaki anlık konumu ileride burada
                            gösterilecek.
                          </p>
                        )}
                      </div>
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
                  <td>{item.hatAdi}</td>
                  <td>{item.hatNumarasi ?? '-'}</td>
                  <td>{item.guzergah}</td>
                  <td>{item.canli ? 'Evet' : 'Hayır'}</td>
                  <td>
                    {item.fiyatTam ?? '-'} / {item.fiyatIndirimli ?? '-'}
                  </td>
                  <td>{ozetKalkis(item.kalkisSaatleri)}</td>
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
        <TelefonOnizleme
          baslik={
            form.hatNumarasi
              ? `${form.hatNumarasi} · ${form.hatAdi || 'Hat'}`
              : form.hatAdi || 'Hat'
          }
        >
          {form.guzergah && <p>{form.guzergah}</p>}
          <div className="genel-onizleme-bolum">
            <span className="genel-onizleme-bolum-baslik">Ücret</span>
            <div className="genel-onizleme-satir">
              <span className="genel-onizleme-satir-etiket">Tam Kart</span>
              <span className="genel-onizleme-satir-ipucu">
                {form.fiyatTam || '-'}
              </span>
            </div>
            <div className="genel-onizleme-satir">
              <span className="genel-onizleme-satir-etiket">İndirimli Kart</span>
              <span className="genel-onizleme-satir-ipucu">
                {form.fiyatIndirimli || '-'}
              </span>
            </div>
          </div>
          <div className="genel-onizleme-bolum">
            <span className="genel-onizleme-bolum-baslik">Kalkış Saatleri</span>
            {(form.kalkisSaatleri ?? []).length === 0 ? (
              <span className="genel-onizleme-bos">Henüz saat eklenmedi</span>
            ) : (
              <>
                <div className="genel-onizleme-satir">
                  <span className="genel-onizleme-satir-etiket">Gidiş</span>
                  <span className="genel-onizleme-satir-ipucu">
                    {(form.kalkisSaatleri ?? [])
                      .filter((k) => k.yon === 'gidis')
                      .map((k) => k.saat)
                      .sort()
                      .join(', ') || '-'}
                  </span>
                </div>
                <div className="genel-onizleme-satir">
                  <span className="genel-onizleme-satir-etiket">Dönüş</span>
                  <span className="genel-onizleme-satir-ipucu">
                    {(form.kalkisSaatleri ?? [])
                      .filter((k) => k.yon === 'donus')
                      .map((k) => k.saat)
                      .sort()
                      .join(', ') || '-'}
                  </span>
                </div>
              </>
            )}
          </div>
          {form.canli && (
            <span className="genel-onizleme-buton">Canlı Konumları Gör</span>
          )}
        </TelefonOnizleme>
      </div>
      </div>
    </div>
  );
}

export default UlasimHatlariPage;
