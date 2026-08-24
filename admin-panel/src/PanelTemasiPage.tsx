import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getPanelTemasi, updatePanelTemasi } from './api';
import type { PanelTemasiInput } from './api';
import { applyPanelTemasi } from './applyTheme';

interface Props {
  canManage: boolean;
}

const emptyForm: PanelTemasiInput = {
  primaryColor: '#1F5C56',
  secondaryColor: '#3E7D74',
  backgroundColor: '#FBF7F1',
  surfaceColor: '#FFFFFF',
  textColor: '#22302C',
  borderColor: '#E4DFD6',
  fontFamily: "'Segoe UI', system-ui, Roboto, sans-serif",
  radius: 10,
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

function PanelTemasiPage({ canManage }: Props) {
  const [form, setForm] = useState<PanelTemasiInput>(emptyForm);
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
      const data = await getPanelTemasi();
      setForm({
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        backgroundColor: data.backgroundColor,
        surfaceColor: data.surfaceColor,
        textColor: data.textColor,
        borderColor: data.borderColor,
        fontFamily: data.fontFamily,
        radius: data.radius,
      });
      setUpdatedBy(data.updatedBy ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Panel teması yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  // Formu degistirirken anlik onizleme icin sayfayi hemen boyar - "Kaydet"e
  // basmadan nasil gorunecegini gormek icin.
  function updateAndPreview(next: PanelTemasiInput) {
    setForm(next);
    applyPanelTemasi(next);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const updated = await updatePanelTemasi(form);
      setUpdatedBy(updated.updatedBy ?? null);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    }
  }

  if (loading) return <div className="page"><p>Yükleniyor...</p></div>;

  return (
    <div className="page">
      <h2>Panel Görünümü</h2>
      <p>
        Bu admin panelinin kendi renklerini, fontunu ve köşe yuvarlaklığını
        buradan değiştirin. Değişiklikler anında (kaydetmeden önce bile)
        önizlenir; "Kaydet" ile kalıcı hale gelir ve panele giren tüm
        kullanıcılar için (giriş ekranı dahil) geçerli olur.
      </p>
      {error && <p className="error-message">{error}</p>}
      {saved && !error && <p className="success-message">Kaydedildi.</p>}

      <form className="inline-form" onSubmit={handleSubmit}>
        <h3 className="form-section-divider">Renkler</h3>
        <ColorField
          label="Ana Renk (Primary)"
          value={form.primaryColor}
          onChange={(v) => updateAndPreview({ ...form, primaryColor: v })}
          disabled={!canManage}
        />
        <ColorField
          label="İkincil Renk (Secondary)"
          value={form.secondaryColor}
          onChange={(v) => updateAndPreview({ ...form, secondaryColor: v })}
          disabled={!canManage}
        />
        <ColorField
          label="Arka Plan"
          value={form.backgroundColor}
          onChange={(v) => updateAndPreview({ ...form, backgroundColor: v })}
          disabled={!canManage}
        />
        <ColorField
          label="Yüzey (Kart/Sidebar)"
          value={form.surfaceColor}
          onChange={(v) => updateAndPreview({ ...form, surfaceColor: v })}
          disabled={!canManage}
        />
        <ColorField
          label="Metin Rengi"
          value={form.textColor}
          onChange={(v) => updateAndPreview({ ...form, textColor: v })}
          disabled={!canManage}
        />
        <ColorField
          label="Kenarlık Rengi"
          value={form.borderColor}
          onChange={(v) => updateAndPreview({ ...form, borderColor: v })}
          disabled={!canManage}
        />

        <h3 className="form-section-divider">Yazı Tipi ve Şekil</h3>
        <label>
          Font Ailesi
          <input
            value={form.fontFamily}
            onChange={(e) => updateAndPreview({ ...form, fontFamily: e.target.value })}
            disabled={!canManage}
            placeholder="'Segoe UI', system-ui, Roboto, sans-serif"
          />
        </label>
        <label>
          Köşe Yuvarlaklığı ({form.radius}px)
          <input
            type="range"
            min={0}
            max={24}
            value={form.radius}
            onChange={(e) =>
              updateAndPreview({ ...form, radius: Number(e.target.value) })
            }
            disabled={!canManage}
          />
        </label>

        {canManage && <button type="submit">Kaydet</button>}
        {updatedBy && <p className="map-editor-readonly-note">Son güncelleyen: {updatedBy}</p>}
      </form>
    </div>
  );
}

export default PanelTemasiPage;
