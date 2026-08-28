import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getBizeUlasin, updateBizeUlasin } from './api';
import type { BizeUlasinInput } from './api';
import KonumSecici from './KonumSecici';
import { BizeUlasinOnizleme, TelefonOnizleme } from './MobilOnizleme';

interface Props {
  canManage: boolean;
}

const emptyForm: BizeUlasinInput = {
  telefon: '',
  whatsapp: '',
  eposta: '',
  adres: '',
  lat: 0,
  lng: 0,
};

function BizeUlasinPage({ canManage }: Props) {
  const [form, setForm] = useState<BizeUlasinInput>(emptyForm);
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
      const data = await getBizeUlasin();
      setForm({
        telefon: data.telefon,
        whatsapp: data.whatsapp,
        eposta: data.eposta,
        adres: data.adres,
        lat: data.lat,
        lng: data.lng,
      });
      setUpdatedBy(data.updatedBy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bize Ulaşın içeriği yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const updated = await updateBizeUlasin(form);
      setUpdatedBy(updated.updatedBy);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    }
  }

  if (loading) return <div className="page"><p>Yükleniyor...</p></div>;

  return (
    <div className="page">
      <h2>Bize Ulaşın</h2>
      <p>Mobil uygulamadaki "Bize Ulaşın" ekranının iletişim bilgilerini buradan yönetin.</p>
      {error && <p className="error-message">{error}</p>}
      {saved && !error && <p className="success-message">Kaydedildi.</p>}

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      <form className="inline-form" onSubmit={handleSubmit}>
        <label>
          Çağrı Merkezi Telefonu
          <input
            value={form.telefon}
            onChange={(e) => setForm({ ...form, telefon: e.target.value })}
            disabled={!canManage}
            placeholder="444 80 59"
            required
          />
        </label>
        <label>
          WhatsApp Numarası (uluslararası format)
          <input
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            disabled={!canManage}
            placeholder="905309556463"
          />
        </label>
        <label>
          E-posta
          <input
            value={form.eposta}
            onChange={(e) => setForm({ ...form, eposta: e.target.value })}
            disabled={!canManage}
            placeholder="kapakli@kapakli.bel.tr"
          />
        </label>
        <label>
          Adres
          <textarea
            value={form.adres}
            onChange={(e) => setForm({ ...form, adres: e.target.value })}
            disabled={!canManage}
          />
        </label>
        <label>
          Enlem (lat)
          <input
            type="number"
            step="any"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
            disabled={!canManage}
          />
        </label>
        <label>
          Boylam (lng)
          <input
            type="number"
            step="any"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
            disabled={!canManage}
          />
        </label>
        <KonumSecici
          lat={form.lat}
          lng={form.lng}
          onChange={(lat, lng, adres) =>
            setForm({ ...form, lat, lng, adres: adres ?? form.adres })
          }
          disabled={!canManage}
        />
        {canManage && <button type="submit">Kaydet</button>}
        {updatedBy && <p className="map-editor-readonly-note">Son güncelleyen: {updatedBy}</p>}
      </form>
      </div>

      <div className="guncel-sag">
        <h3 className="bolum-baslik">Mobil Uygulamadaki Görüntüsü</h3>
        <TelefonOnizleme baslik="Bize Ulaşın" varyant="duz" sagIkon="help">
          <BizeUlasinOnizleme
            telefon={form.telefon}
            whatsapp={form.whatsapp}
            eposta={form.eposta}
            adres={form.adres}
          />
        </TelefonOnizleme>
      </div>
      </div>
    </div>
  );
}

export default BizeUlasinPage;
