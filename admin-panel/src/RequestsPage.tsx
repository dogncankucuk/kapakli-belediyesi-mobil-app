import { Fragment, useEffect, useState } from 'react';
import { deleteRequest, getRequests, updateRequest } from './api';
import { csvIndir } from './csvExport';
import type { TalepDurumu, TalepRequest } from './types';
import { talepDurumLabels, talepKategoriLabels } from './types';

interface Props {
  canManage: boolean;
}

const durumSecenekleri: TalepDurumu[] = ['beklemede', 'islemde', 'tamamlandi'];

const kategoriSecenekleri = Object.entries(talepKategoriLabels);

const yogunlukEtiketleri = ['Hafif', 'Orta', 'Yoğun', 'Şiddetli'];

const SAYFA_BOYUTU = 50;

function formatTarih(iso: string): string {
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const bosFiltreler = {
  kategori: '',
  durum: '',
  adSoyad: '',
  telefon: '',
  talepNo: '',
  baslangic: '',
  bitis: '',
};

function RequestsPage({ canManage }: Props) {
  const [items, setItems] = useState<TalepRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtreler, setFiltreler] = useState(bosFiltreler);
  const [page, setPage] = useState(1);
  const [disaAktariliyor, setDisaAktariliyor] = useState(false);
  // Dahili not ve kullaniciya gosterilecek not - durum degisikliginden bagimsiz,
  // ayri bir "Notlari Kaydet" aksiyonuyla PATCH atilir (bkz. BasvurularPage).
  const [notTaslaklari, setNotTaslaklari] = useState<
    Record<string, { adminNotu: string; kullaniciNotu: string }>
  >({});

  // Talep sayisi buyudukce "hepsini cek, tarayicida filtrele" hem backend'i
  // hem bu sayfayi kilitler - filtreleme/sayfalama backend'de yapiliyor,
  // burada sadece yazarken her tus vurusunda istek atmamak icin kisa bir
  // bekleme (debounce) var.
  useEffect(() => {
    const zamanlayici = setTimeout(() => {
      load();
    }, 350);
    return () => clearTimeout(zamanlayici);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreler, page]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const sonuc = await getRequests({ page, pageSize: SAYFA_BOYUTU, ...filtreler });
      setItems(sonuc.items);
      setTotal(sonuc.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Talepler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  function filtreDegistir(kismi: Partial<typeof bosFiltreler>) {
    setFiltreler({ ...filtreler, ...kismi });
    setPage(1);
  }

  async function handleDurumChange(id: string, durum: TalepDurumu) {
    setUpdatingId(id);
    setError(null);
    try {
      await updateRequest(id, { durum });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Talep güncellenemedi');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDisaAktar() {
    setDisaAktariliyor(true);
    setError(null);
    try {
      const sonuc = await getRequests({
        ...filtreler,
        page: 1,
        pageSize: Math.max(total, 1),
      });
      csvIndir(
        `talepler-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Talep No', 'Tarih', 'Kategori', 'Açıklama', 'Ad Soyad', 'Telefon', 'Durum', 'Adres'],
        sonuc.items.map((item) => [
          item.talepNo,
          formatTarih(item.createdAt),
          talepKategoriLabels[item.kategori] ?? item.kategori,
          item.aciklama,
          item.adSoyad,
          item.telefon,
          talepDurumLabels[item.durum],
          item.adres ?? '',
        ]),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dışa aktarılamadı');
    } finally {
      setDisaAktariliyor(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu talep silinsin mi?')) return;
    setUpdatingId(id);
    setError(null);
    try {
      await deleteRequest(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Talep silinemedi');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleNotKaydet(item: TalepRequest) {
    const taslak = notTaslaklari[item.id] ?? {
      adminNotu: item.adminNotu ?? '',
      kullaniciNotu: item.kullaniciNotu ?? '',
    };
    setUpdatingId(item.id);
    setError(null);
    try {
      await updateRequest(item.id, {
        adminNotu: taslak.adminNotu,
        kullaniciNotu: taslak.kullaniciNotu,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Notlar kaydedilemedi');
    } finally {
      setUpdatingId(null);
    }
  }

  const filtreAktif = Object.values(filtreler).some((deger) => deger);
  const toplamSayfa = Math.max(1, Math.ceil(total / SAYFA_BOYUTU));

  return (
    <div className="page">
      <h2>Talepler</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="talep-filtre-bar">
        <label>
          Kategori
          <select
            value={filtreler.kategori}
            onChange={(e) => filtreDegistir({ kategori: e.target.value })}
          >
            <option value="">Tümü</option>
            {kategoriSecenekleri.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Durum
          <select
            value={filtreler.durum}
            onChange={(e) => filtreDegistir({ durum: e.target.value })}
          >
            <option value="">Tümü</option>
            {durumSecenekleri.map((durum) => (
              <option key={durum} value={durum}>
                {talepDurumLabels[durum]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ad Soyad
          <input
            value={filtreler.adSoyad}
            onChange={(e) => filtreDegistir({ adSoyad: e.target.value })}
            placeholder="Ara..."
          />
        </label>
        <label>
          Telefon
          <input
            value={filtreler.telefon}
            onChange={(e) => filtreDegistir({ telefon: e.target.value })}
            placeholder="Ara..."
          />
        </label>
        <label>
          Talep No
          <input
            value={filtreler.talepNo}
            onChange={(e) => filtreDegistir({ talepNo: e.target.value })}
            placeholder="Ör. 02-000014"
          />
        </label>
        <label>
          Başlangıç Tarihi
          <input
            type="date"
            value={filtreler.baslangic}
            onChange={(e) => filtreDegistir({ baslangic: e.target.value })}
          />
        </label>
        <label>
          Bitiş Tarihi
          <input
            type="date"
            value={filtreler.bitis}
            onChange={(e) => filtreDegistir({ bitis: e.target.value })}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setFiltreler(bosFiltreler);
            setPage(1);
          }}
        >
          Filtreleri Temizle
        </button>
        <button
          type="button"
          onClick={handleDisaAktar}
          disabled={disaAktariliyor || total === 0}
        >
          {disaAktariliyor ? 'Aktarılıyor...' : 'Excel\'e Aktar'}
        </button>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : items.length === 0 ? (
        <p>{filtreAktif ? 'Filtreye uyan talep bulunamadı.' : 'Henüz talep gelmemiş.'}</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Talep No</th>
                <th>Tarih</th>
                <th>Kategori</th>
                <th>Açıklama</th>
                <th>Ad Soyad</th>
                <th>Telefon</th>
                <th>Durum</th>
                <th>Detay</th>
                {canManage && <th>İşlemler</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const expanded = expandedId === item.id;
                const detayVar =
                  item.lat != null ||
                  item.lng != null ||
                  !!item.adres ||
                  item.fotograflar.length > 0 ||
                  item.yogunluk != null ||
                  item.ekDosyaUrl ||
                  canManage ||
                  item.adminNotu ||
                  item.kullaniciNotu;
                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td>{item.talepNo}</td>
                      <td>{formatTarih(item.createdAt)}</td>
                      <td>{talepKategoriLabels[item.kategori] ?? item.kategori}</td>
                      <td>{item.aciklama}</td>
                      <td>{item.adSoyad}</td>
                      <td>{item.telefon}</td>
                      <td>{talepDurumLabels[item.durum]}</td>
                      <td>
                        {detayVar && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : item.id)}
                          >
                            {expanded ? 'Gizle' : 'Görüntüle'}
                          </button>
                        )}
                      </td>
                      {canManage && (
                        <td className="row-actions">
                          <select
                            value={item.durum}
                            disabled={updatingId === item.id}
                            onChange={(e) =>
                              handleDurumChange(item.id, e.target.value as TalepDurumu)
                            }
                          >
                            {durumSecenekleri.map((durum) => (
                              <option key={durum} value={durum}>
                                {talepDurumLabels[durum]}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={updatingId === item.id}
                            onClick={() => handleDelete(item.id)}
                          >
                            Sil
                          </button>
                        </td>
                      )}
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={canManage ? 9 : 8}>
                          <div className="edit-row">
                            {item.adres && (
                              <p>
                                <strong>Adres:</strong> {item.adres}
                              </p>
                            )}
                            {(item.lat != null || item.lng != null) && (
                              <p>
                                <strong>Konum:</strong> {item.lat?.toFixed(5)},{' '}
                                {item.lng?.toFixed(5)}{' '}
                                <a
                                  href={`https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lng}#map=17/${item.lat}/${item.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Haritada gör
                                </a>
                              </p>
                            )}
                            {item.yogunluk != null && (
                              <p>
                                <strong>Yoğunluk:</strong>{' '}
                                {yogunlukEtiketleri[item.yogunluk] ?? item.yogunluk}
                              </p>
                            )}
                            {item.ekDosyaUrl && (
                              <p>
                                <strong>Ek Dosya:</strong>{' '}
                                <a href={item.ekDosyaUrl} target="_blank" rel="noreferrer">
                                  {item.ekDosyaUrl}
                                </a>
                              </p>
                            )}
                            {item.fotograflar.length > 0 && (
                              <div>
                                <strong>Fotoğraflar:</strong>
                                <div className="request-photo-row">
                                  {item.fotograflar.map((url, index) => (
                                    <img
                                      key={index}
                                      src={url}
                                      alt={`Talep fotoğrafı ${index + 1}`}
                                      className="request-photo-thumb"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {canManage ? (
                              <div className="edit-row">
                                <label>
                                  Dahili Not (sadece panelde görünür)
                                  <textarea
                                    maxLength={2000}
                                    value={
                                      (notTaslaklari[item.id] ?? {
                                        adminNotu: item.adminNotu ?? '',
                                        kullaniciNotu: item.kullaniciNotu ?? '',
                                      }).adminNotu
                                    }
                                    onChange={(e) =>
                                      setNotTaslaklari({
                                        ...notTaslaklari,
                                        [item.id]: {
                                          adminNotu: e.target.value,
                                          kullaniciNotu: (notTaslaklari[item.id] ?? {
                                            adminNotu: item.adminNotu ?? '',
                                            kullaniciNotu: item.kullaniciNotu ?? '',
                                          }).kullaniciNotu,
                                        },
                                      })
                                    }
                                  />
                                </label>
                                <label>
                                  Kullanıcıya Gösterilecek Not
                                  <textarea
                                    maxLength={2000}
                                    value={
                                      (notTaslaklari[item.id] ?? {
                                        adminNotu: item.adminNotu ?? '',
                                        kullaniciNotu: item.kullaniciNotu ?? '',
                                      }).kullaniciNotu
                                    }
                                    onChange={(e) =>
                                      setNotTaslaklari({
                                        ...notTaslaklari,
                                        [item.id]: {
                                          adminNotu: (notTaslaklari[item.id] ?? {
                                            adminNotu: item.adminNotu ?? '',
                                            kullaniciNotu: item.kullaniciNotu ?? '',
                                          }).adminNotu,
                                          kullaniciNotu: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </label>
                                <button
                                  type="button"
                                  disabled={updatingId === item.id}
                                  onClick={() => handleNotKaydet(item)}
                                >
                                  Notları Kaydet
                                </button>
                              </div>
                            ) : (
                              <>
                                {item.adminNotu && (
                                  <p>
                                    <strong>Dahili Not:</strong> {item.adminNotu}
                                  </p>
                                )}
                                {item.kullaniciNotu && (
                                  <p>
                                    <strong>Kullanıcıya Gösterilecek Not:</strong>{' '}
                                    {item.kullaniciNotu}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          <div className="talep-sayfalama">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Önceki
            </button>
            <span>
              Sayfa {page} / {toplamSayfa} · Toplam {total} kayıt
            </span>
            <button
              type="button"
              disabled={page >= toplamSayfa}
              onClick={() => setPage(page + 1)}
            >
              Sonraki
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default RequestsPage;
