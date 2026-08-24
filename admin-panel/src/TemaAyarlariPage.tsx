import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getTemaAyarlari, updateTemaAyarlari } from './api';
import type { TemaAyarlariInput } from './api';

interface Props {
  canManage: boolean;
}

const emptyForm: TemaAyarlariInput = {
  primaryColorLight: '#1F5C56',
  secondaryColorLight: '#3E7D74',
  backgroundColorLight: '#FBF7F1',
  primaryColorDark: '#7FC9BC',
  secondaryColorDark: '#6FB3A6',
  backgroundColorDark: '#12201D',
  fontFamily: 'System',
};

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <label>
      {label}
      <div className="color-field-row">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </label>
  );
}

function TemaAyarlariPage({ canManage }: Props) {
  const [form, setForm] = useState<TemaAyarlariInput>(emptyForm);
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
      const data = await getTemaAyarlari();
      setForm({
        primaryColorLight: data.primaryColorLight,
        secondaryColorLight: data.secondaryColorLight,
        backgroundColorLight: data.backgroundColorLight,
        primaryColorDark: data.primaryColorDark,
        secondaryColorDark: data.secondaryColorDark,
        backgroundColorDark: data.backgroundColorDark,
        fontFamily: data.fontFamily,
      });
      setUpdatedBy(data.updatedBy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görünüm ayarları yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const updated = await updateTemaAyarlari(form);
      setUpdatedBy(updated.updatedBy);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    }
  }

  if (loading) return <div className="page"><p>Yükleniyor...</p></div>;

  return (
    <div className="page">
      <h2>Görünüm Ayarları</h2>
      <p>
        Mobil uygulamanın renk paleti ve fontunu buradan tanımlayın. Not: bu
        değerler şu an yalnızca burada saklanıyor — mobil uygulama henüz bu
        ayarlara bağlanmadı (uygulama hâlâ kendi sabit renk temasını
        kullanıyor). Mobil tarafın bu ayarları okuyup uygulaması ayrı bir
        adımda yapılmalı.
      </p>
      {error && <p className="error-message">{error}</p>}
      {saved && !error && <p className="success-message">Kaydedildi.</p>}

      <form className="inline-form" onSubmit={handleSubmit}>
        <h3 className="form-section-divider">Açık Mod</h3>
        <ColorField
          label="Ana Renk (Primary)"
          value={form.primaryColorLight}
          onChange={(v) => setForm({ ...form, primaryColorLight: v })}
          disabled={!canManage}
        />
        <ColorField
          label="İkincil Renk (Secondary)"
          value={form.secondaryColorLight}
          onChange={(v) => setForm({ ...form, secondaryColorLight: v })}
          disabled={!canManage}
        />
        <ColorField
          label="Arka Plan"
          value={form.backgroundColorLight}
          onChange={(v) => setForm({ ...form, backgroundColorLight: v })}
          disabled={!canManage}
        />

        <h3 className="form-section-divider">Koyu Mod</h3>
        <ColorField
          label="Ana Renk (Primary)"
          value={form.primaryColorDark}
          onChange={(v) => setForm({ ...form, primaryColorDark: v })}
          disabled={!canManage}
        />
        <ColorField
          label="İkincil Renk (Secondary)"
          value={form.secondaryColorDark}
          onChange={(v) => setForm({ ...form, secondaryColorDark: v })}
          disabled={!canManage}
        />
        <ColorField
          label="Arka Plan"
          value={form.backgroundColorDark}
          onChange={(v) => setForm({ ...form, backgroundColorDark: v })}
          disabled={!canManage}
        />

        <h3 className="form-section-divider">Yazı Tipi</h3>
        <label>
          Font Adı
          <input
            value={form.fontFamily}
            onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
            disabled={!canManage}
            placeholder="System"
          />
        </label>

        {canManage && <button type="submit">Kaydet</button>}
        {updatedBy && <p className="map-editor-readonly-note">Son güncelleyen: {updatedBy}</p>}
      </form>
    </div>
  );
}

export default TemaAyarlariPage;
