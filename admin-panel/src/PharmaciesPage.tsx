import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  createPharmacy,
  deletePharmacy,
  getPharmacies,
  updatePharmacy,
} from './api';
import type { PharmacyInput } from './api';
import type { Pharmacy } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: PharmacyInput = {
  ad: '',
  adres: '',
  telefon: '',
  nobetTarihi: '',
  lat: 41.33,
  lng: 27.97,
};

// Basit CSV satir ayirici - tirnak icindeki virgulleri korur ("" ile
// kacirilmis tirnaklari da destekler).
function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',' || char === ';') {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

const HEADER_ALIASES: Record<string, keyof PharmacyInput> = {
  tarih: 'nobetTarihi',
  nobettarihi: 'nobetTarihi',
  'nöbet tarihi': 'nobetTarihi',
  'nobet tarihi': 'nobetTarihi',
  ad: 'ad',
  eczaneadi: 'ad',
  'eczane adı': 'ad',
  'eczane adi': 'ad',
  isim: 'ad',
  telefon: 'telefon',
  tel: 'telefon',
  adres: 'adres',
  lat: 'lat',
  enlem: 'lat',
  latitude: 'lat',
  lng: 'lng',
  lon: 'lng',
  boylam: 'lng',
  longitude: 'lng',
};

// "12.03.2026" ya da "2026-03-12" formatlarini <input type=date> icin
// ISO (yyyy-mm-dd) formatina cevirir.
function normalizeTarih(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  if (match) {
    const [, gun, ay, yil] = match;
    return `${yil}-${ay.padStart(2, '0')}-${gun.padStart(2, '0')}`;
  }
  return trimmed;
}

function parsePharmacyCsv(text: string): PharmacyInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) return [];

  const headerCells = parseCsvLine(lines[0]).map((h) =>
    h.trim().toLocaleLowerCase('tr-TR'),
  );
  const columns = headerCells.map((h) => HEADER_ALIASES[h] ?? null);

  const rows: PharmacyInput[] = [];
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const record: Partial<PharmacyInput> = {};
    columns.forEach((key, index) => {
      if (!key) return;
      const value = cells[index] ?? '';
      if (key === 'lat' || key === 'lng') {
        record[key] = Number(value.replace(',', '.'));
      } else if (key === 'nobetTarihi') {
        record[key] = normalizeTarih(value);
      } else {
        record[key] = value;
      }
    });
    if (record.ad && record.telefon && record.adres && record.nobetTarihi) {
      rows.push({
        ad: record.ad,
        telefon: record.telefon,
        adres: record.adres,
        nobetTarihi: record.nobetTarihi,
        lat: record.lat ?? 0,
        lng: record.lng ?? 0,
      });
    }
  }
  return rows;
}

function PharmaciesPage({ canManage }: Props) {
  const [items, setItems] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PharmacyInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PharmacyInput>(emptyForm);
  const [csvBusy, setCsvBusy] = useState(false);
  const [csvResult, setCsvResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  async function handleCsvUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvBusy(true);
    setCsvResult(null);
    setError(null);
    try {
      const text = await file.text();
      const rows = parsePharmacyCsv(text);
      if (rows.length === 0) {
        setCsvResult('CSV dosyasında geçerli satır bulunamadı.');
        return;
      }
      let success = 0;
      let failed = 0;
      for (const row of rows) {
        try {
          await createPharmacy(row);
          success++;
        } catch {
          failed++;
        }
      }
      setCsvResult(
        `${success} kayıt eklendi${failed > 0 ? `, ${failed} kayıt başarısız oldu` : ''}.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV dosyası okunamadı');
    } finally {
      setCsvBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getPharmacies());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eczaneler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPharmacy(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eczane oluşturulamadı');
    }
  }

  function startEdit(item: Pharmacy) {
    setEditingId(item.id);
    setEditForm({
      ad: item.ad,
      adres: item.adres,
      telefon: item.telefon,
      nobetTarihi: item.nobetTarihi.slice(0, 10),
      lat: item.lat,
      lng: item.lng,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updatePharmacy(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eczane güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu eczane kaydı silinsin mi?')) return;
    setError(null);
    try {
      await deletePharmacy(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eczane silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Nöbetçi Eczaneler</h2>
      <p>
        Alanlar, belediyenin resmi nöbetçi eczane sayfasındaki sırayla aynıdır
        (Tarih / Eczane Adı / Telefon / Adres). Konum bilgisi yalnızca harita
        katmanında gösterim için kullanılır.
      </p>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <div className="inline-form">
          <h3>CSV ile Toplu Yükleme</h3>
          <p>
            Beklenen sütunlar: <code>Tarih, Eczane Adı, Telefon, Adres, Lat, Lng</code>{' '}
            (başlık satırı zorunlu, sütun sırası önemli değil, virgül veya
            noktalı virgülle ayrılmış olabilir. Tarih <code>YYYY-AA-GG</code>{' '}
            veya <code>GG.AA.YYYY</code> formatında olabilir).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvUpload}
            disabled={csvBusy}
          />
          {csvBusy && <p>Yükleniyor...</p>}
          {csvResult && <p className="success-message">{csvResult}</p>}
        </div>
      )}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Kayıt</h3>
          <label>
            Nöbet Tarihi
            <input
              type="date"
              value={form.nobetTarihi}
              onChange={(e) => setForm({ ...form, nobetTarihi: e.target.value })}
              required
            />
          </label>
          <label>
            Eczane Adı
            <input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required />
          </label>
          <label>
            Telefon
            <input
              value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })}
              required
            />
          </label>
          <label>
            Adres
            <input
              value={form.adres}
              onChange={(e) => setForm({ ...form, adres: e.target.value })}
              required
            />
          </label>
          <h3 className="form-section-divider">Harita Konumu</h3>
          <label>
            Enlem (lat)
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Boylam (lng)
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
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
              <th>Nöbet Tarihi</th>
              <th>Eczane Adı</th>
              <th>Telefon</th>
              <th>Adres</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td colSpan={canManage ? 5 : 4}>
                    <div className="edit-row">
                      <label>
                        Nöbet Tarihi
                        <input
                          type="date"
                          value={editForm.nobetTarihi}
                          onChange={(e) =>
                            setEditForm({ ...editForm, nobetTarihi: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Eczane Adı
                        <input
                          value={editForm.ad}
                          onChange={(e) => setEditForm({ ...editForm, ad: e.target.value })}
                        />
                      </label>
                      <label>
                        Telefon
                        <input
                          value={editForm.telefon}
                          onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })}
                        />
                      </label>
                      <label>
                        Adres
                        <input
                          value={editForm.adres}
                          onChange={(e) => setEditForm({ ...editForm, adres: e.target.value })}
                        />
                      </label>
                      <label>
                        Enlem (lat)
                        <input
                          type="number"
                          step="any"
                          value={editForm.lat}
                          onChange={(e) => setEditForm({ ...editForm, lat: Number(e.target.value) })}
                        />
                      </label>
                      <label>
                        Boylam (lng)
                        <input
                          type="number"
                          step="any"
                          value={editForm.lng}
                          onChange={(e) => setEditForm({ ...editForm, lng: Number(e.target.value) })}
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
                  <td>{item.nobetTarihi.slice(0, 10)}</td>
                  <td>{item.ad}</td>
                  <td>{item.telefon}</td>
                  <td>{item.adres}</td>
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

export default PharmaciesPage;
