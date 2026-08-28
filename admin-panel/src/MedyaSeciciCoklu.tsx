import { useState } from 'react';
import { MedyaSeciciModal } from './MedyaSecici';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

// MedyaSecici'nin coklu-secim versiyonu - birden fazla resim/PDF/belge
// eklenebilmesi gereken alanlarda (Guncel: Haberler/Duyurular/Ilanlar/
// Ihaleler/Makaleler/Meclis Gundemleri/Meclis Karari) kullanilir. Modal,
// tek-secimli MedyaSecici'nin aksine her secimde kapanmaz - admin
// kutuphaneden birden fazla dosyayi arka arkaya secip sonra "Kapat" ile
// modali kendisi kapatir.
function MedyaSeciciCoklu({ value, onChange, disabled, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [manuelUrl, setManuelUrl] = useState('');

  function ekle(url: string) {
    if (!url || value.includes(url)) return;
    onChange([...value, url]);
  }

  function sil(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="medya-coklu">
      <div className="medya-coklu-liste">
        {value.length === 0 && (
          <span className="medya-coklu-bos">Henüz dosya seçilmedi</span>
        )}
        {value.map((url) => (
          <div className="medya-coklu-item" key={url}>
            <span className="medya-coklu-item-ad" title={url}>
              {url.split('/').pop()}
            </span>
            {!disabled && (
              <button type="button" onClick={() => sil(url)} aria-label="Kaldır">
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {!disabled && (
        <div className="medya-secici-row">
          <input
            value={manuelUrl}
            onChange={(e) => setManuelUrl(e.target.value)}
            placeholder={placeholder ?? "https://... (Ekle'ye basın)"}
          />
          <button
            type="button"
            onClick={() => {
              ekle(manuelUrl);
              setManuelUrl('');
            }}
            disabled={!manuelUrl}
          >
            Ekle
          </button>
          <button type="button" onClick={() => setOpen(true)}>
            Medyadan Seç
          </button>
        </div>
      )}
      {open && (
        <MedyaSeciciModal onSelect={(url) => ekle(url)} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

export default MedyaSeciciCoklu;
