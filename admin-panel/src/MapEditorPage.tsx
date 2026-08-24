import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  getCamiler,
  updateCami,
  getOnemliKurumlar,
  updateOnemliKurum,
  getParklar,
  updatePark,
  getTarihiYerler,
  updateTarihiYer,
  getWifiNoktalari,
  updateWifiNoktasi,
  getPharmacies,
  updatePharmacy,
} from './api';

// Vite ile Leaflet'in varsayilan marker ikonlari dogru cozumlenmiyor -
// bilinen bir sorun, standart duzeltme budur.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Props {
  canManage: boolean;
}

type MapItem = { id: string; ad: string; lat: number; lng: number };

function toMapItem(d: { id: string; ad: string; lat: number; lng: number }): MapItem {
  return { id: d.id, ad: d.ad, lat: d.lat, lng: d.lng };
}

const CATEGORIES: {
  value: string;
  label: string;
  get: () => Promise<MapItem[]>;
  update: (id: string, lat: number, lng: number) => Promise<void>;
}[] = [
  {
    value: 'camiler',
    label: 'Camiler',
    get: async () => (await getCamiler()).map(toMapItem),
    update: async (id, lat, lng) => {
      await updateCami(id, { lat, lng });
    },
  },
  {
    value: 'onemliKurumlar',
    label: 'Önemli Kurumlar',
    get: async () => (await getOnemliKurumlar()).map(toMapItem),
    update: async (id, lat, lng) => {
      await updateOnemliKurum(id, { lat, lng });
    },
  },
  {
    value: 'parklar',
    label: 'Parklar',
    get: async () => (await getParklar()).map(toMapItem),
    update: async (id, lat, lng) => {
      await updatePark(id, { lat, lng });
    },
  },
  {
    value: 'tarihiYerler',
    label: 'Tarihi Yerler',
    get: async () => (await getTarihiYerler()).map(toMapItem),
    update: async (id, lat, lng) => {
      await updateTarihiYer(id, { lat, lng });
    },
  },
  {
    value: 'wifiNoktalari',
    label: 'Wi-Fi Noktaları',
    get: async () => (await getWifiNoktalari()).map(toMapItem),
    update: async (id, lat, lng) => {
      await updateWifiNoktasi(id, { lat, lng });
    },
  },
  {
    value: 'pharmacies',
    label: 'Eczaneler',
    get: async () => (await getPharmacies()).map(toMapItem),
    update: async (id, lat, lng) => {
      await updatePharmacy(id, { lat, lng });
    },
  },
];

const KAPAKLI_CENTER: L.LatLngExpression = [41.33, 27.975];

function MapEditorPage({ canManage }: Props) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [items, setItems] = useState<MapItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const category = CATEGORIES[categoryIndex];
  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  // Harita bir kez olusturulur, sonraki render'larda tekrar kurulmaz.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current).setView(KAPAKLI_CENTER, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap katkıda bulunanlar',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker(KAPAKLI_CENTER, { draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setMarkerPos({ lat: pos.lat, lng: pos.lng });
      setSuccess(null);
    });
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setMarkerPos({ lat: e.latlng.lat, lng: e.latlng.lng });
      setSuccess(null);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedId('');
    setMarkerPos(null);
    category
      .get()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Kayıtlar yüklenemedi'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryIndex]);

  function selectItem(id: string) {
    setSelectedId(id);
    setSuccess(null);
    const item = items.find((i) => i.id === id);
    if (item && mapRef.current && markerRef.current) {
      const latlng: L.LatLngExpression = [item.lat, item.lng];
      markerRef.current.setLatLng(latlng);
      mapRef.current.setView(latlng, 17);
      setMarkerPos({ lat: item.lat, lng: item.lng });
    }
  }

  async function handleSave() {
    if (!selectedId || !markerPos) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await category.update(selectedId, markerPos.lat, markerPos.lng);
      setSuccess('Konum güncellendi.');
      const updated = await category.get();
      setItems(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konum güncellenemedi');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h2>Harita Editörü</h2>
      <p>
        Bir kategori ve kayıt seçin, ardından haritada tıklayarak veya
        işaretçiyi sürükleyerek konumu güncelleyin.
      </p>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="map-editor-controls">
        <label>
          Kategori
          <select
            value={categoryIndex}
            onChange={(e) => setCategoryIndex(Number(e.target.value))}
          >
            {CATEGORIES.map((cat, index) => (
              <option key={cat.value} value={index}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kayıt
          <select
            value={selectedId}
            onChange={(e) => selectItem(e.target.value)}
            disabled={loading || items.length === 0}
          >
            <option value="">
              {loading ? 'Yükleniyor...' : `Seçiniz (${items.length} kayıt)`}
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.ad}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="map-editor-shell">
        <div ref={mapContainerRef} className="map-editor-canvas" />
      </div>

      {selectedItem && markerPos && (
        <div className="map-editor-footer">
          <div className="map-editor-coords">
            <span>
              <strong>{selectedItem.ad}</strong>
            </span>
            <span>Enlem: {markerPos.lat.toFixed(6)}</span>
            <span>Boylam: {markerPos.lng.toFixed(6)}</span>
          </div>
          {canManage ? (
            <button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Konumu Kaydet'}
            </button>
          ) : (
            <span className="map-editor-readonly-note">
              Konumu değiştirmek için içerik yönetici yetkisi gerekiyor.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MapEditorPage;
