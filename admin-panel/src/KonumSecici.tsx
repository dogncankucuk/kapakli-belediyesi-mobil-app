import { useEffect, useRef, useState } from 'react';
import type L from 'leaflet';
import LeafletLib, { KAPAKLI_CENTER } from './leafletSetup';

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, adres?: string) => void;
  disabled?: boolean;
}

// Nominatim (OpenStreetMap'in ucretsiz ters-geocoding servisi) - API anahtari
// gerektirmiyor, tarayicidan dogrudan cagrilabilir (CORS'a izin veriyor).
// Kullanim politikasi max 1 istek/sn diyor - burada sadece kullanici
// haritada tiklayip/surukleyip biraktiginda (dragend/click, surekli degil)
// tetiklendigi icin bu sinirin cok altinda kaliyoruz.
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=tr`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

// Enlem/boylam text input'larinin yanina "Haritadan Seç" butonu ekler - elle
// koordinat girmeye alternatif olarak, haritada tiklayarak/isaretciyi
// surukleyerek konum secmeyi saglar. Elle giris secenegi (input'lar) kalir,
// bu sadece ek bir yol. Konum secildiginde adres de otomatik doldurulur.
function KonumSecici({ lat, lng, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!disabled && (
        <button type="button" onClick={() => setOpen(true)}>
          Haritadan Seç
        </button>
      )}
      {open && (
        <KonumSeciciModal
          initialLat={lat}
          initialLng={lng}
          onConfirm={(newLat, newLng, adres) => {
            onChange(newLat, newLng, adres);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function KonumSeciciModal({
  initialLat,
  initialLng,
  onConfirm,
  onClose,
}: {
  initialLat: number;
  initialLng: number;
  onConfirm: (lat: number, lng: number, adres?: string) => void;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const startCenter: L.LatLngExpression =
      initialLat && initialLng ? [initialLat, initialLng] : KAPAKLI_CENTER;
    const map = LeafletLib.map(mapContainerRef.current).setView(startCenter, 15);
    LeafletLib.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap katkıda bulunanlar',
      maxZoom: 19,
    }).addTo(map);

    const marker = LeafletLib.marker(startCenter, { draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const p = marker.getLatLng();
      setPos({ lat: p.lat, lng: p.lng });
    });
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;
    // Modal acildiginda konteynerin nihai boyutu render sonrasi netlesiyor -
    // Leaflet'in bunu dogru olceklemesi icin bir sonraki tick'te tetikleriz.
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pos degistikce (tiklama/surukleme birakildiginda) adresi otomatik cek.
  useEffect(() => {
    let cancelled = false;
    setAddressLoading(true);
    reverseGeocode(pos.lat, pos.lng).then((result) => {
      if (!cancelled) {
        setAddress(result);
        setAddressLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pos]);

  return (
    <div className="medya-modal-overlay" onClick={onClose}>
      <div className="medya-modal" onClick={(e) => e.stopPropagation()}>
        <div className="medya-modal-header">
          <h3>Haritadan Konum Seç</h3>
          <button type="button" onClick={onClose}>
            Kapat
          </button>
        </div>
        <p>Konumu belirlemek için haritada tıklayın veya işaretçiyi sürükleyin.</p>
        <div ref={mapContainerRef} className="konum-secici-canvas" />
        <div className="map-editor-coords">
          <span>Enlem: {pos.lat.toFixed(6)}</span>
          <span>Boylam: {pos.lng.toFixed(6)}</span>
        </div>
        <p className="konum-secici-address">
          Adres: {addressLoading ? 'Bulunuyor...' : (address ?? 'Bulunamadı')}
        </p>
        <button
          type="button"
          onClick={() => onConfirm(pos.lat, pos.lng, address ?? undefined)}
        >
          Bu Konumu Kullan
        </button>
      </div>
    </div>
  );
}

export default KonumSecici;
