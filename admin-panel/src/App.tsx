import { useEffect, useMemo, useState } from 'react';
import { getPublicPanelTemasi, logout, me } from './api';
import { applyPanelTemasi } from './applyTheme';
import type { AdminUser } from './types';
import LoginPage from './LoginPage';
import AnnouncementsPage from './AnnouncementsPage';
import HaberlerPage from './HaberlerPage';
import IlanlarPage from './IlanlarPage';
import IhalelerPage from './IhalelerPage';
import MakalelerPage from './MakalelerPage';
import MeclisGundemleriPage from './MeclisGundemleriPage';
import BaskanPage from './BaskanPage';
import HakkimizdaPage from './HakkimizdaPage';
import YardimMerkeziPage from './YardimMerkeziPage';
import BizeUlasinPage from './BizeUlasinPage';
import FaturaOdemePage from './FaturaOdemePage';
import UlasimHatlariPage from './UlasimHatlariPage';
import AtikRehberiPage from './AtikRehberiPage';
import TemaAyarlariPage from './TemaAyarlariPage';
import PanelTemasiPage from './PanelTemasiPage';
import MedyaPage from './MedyaPage';
import AtikNoktalariPage from './AtikNoktalariPage';
import AppointmentsPage from './AppointmentsPage';
import RequestsPage from './RequestsPage';
import PharmaciesPage from './PharmaciesPage';
import MeclisKararlariPage from './MeclisKararlariPage';
import VefatEdenlerPage from './VefatEdenlerPage';
import WifiNoktalariPage from './WifiNoktalariPage';
import SuHizmetleriPage from './SuHizmetleriPage';
import FenIsleriPage from './FenIsleriPage';
import ElektrikPage from './ElektrikPage';
import AseviPage from './AseviPage';
import CamilerPage from './CamilerPage';
import OnemliKurumlarPage from './OnemliKurumlarPage';
import ParklarPage from './ParklarPage';
import TarihiYerlerPage from './TarihiYerlerPage';
import FormlarPage from './FormlarPage';
import BasvuruHizmetleriPage from './BasvuruHizmetleriPage';
import BasvuruTurleriPage from './BasvuruTurleriPage';
import BasvurularPage from './BasvurularPage';
import MapEditorPage from './MapEditorPage';
import UsersPage from './UsersPage';
import RolesPage from './RolesPage';
import AdminUsersPage from './AdminUsersPage';
import NotificationsPage from './NotificationsPage';
import './App.css';

import {
  MAP_EDITOR_RESOURCES,
  NAV_GROUPS,
  pageResource,
} from './navGroups';
import type { Page } from './navGroups';

const SAYFA_DEPOLAMA_ANAHTARI = 'kapakli-admin-sayfa';

function App() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState<Page | null>(
    () => (localStorage.getItem(SAYFA_DEPOLAMA_ANAHTARI) as Page | null) ?? null,
  );
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [sidebarArama, setSidebarArama] = useState('');

  function toggleGroup(heading: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(heading)) {
        next.delete(heading);
      } else {
        next.add(heading);
      }
      return next;
    });
  }

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
    // Login ekrani dahil her sayfa temali gorunsun diye kimlik dogrulama
    // sonucunu beklemeden, kimlik dogrulamasiz genel uctan cekilir.
    getPublicPanelTemasi()
      .then(applyPanelTemasi)
      .catch(() => {
        // Tema alinamazsa index.css'teki varsayilan degerlerle devam edilir.
      });
  }, []);

  const canView = useMemo(() => {
    return (resource: string): boolean => {
      if (!user) return false;
      if (user.role.isFullAccess) return true;
      return (user.permissions[resource] ?? []).includes('list');
    };
  }, [user]);

  const canManage = useMemo(() => {
    return (resource: string): boolean => {
      if (!user) return false;
      if (user.role.isFullAccess) return true;
      return (user.permissions[resource] ?? []).includes('manage');
    };
  }, [user]);

  const canViewPage = useMemo(() => {
    return (p: Page): boolean => {
      if (p === 'mapEditor') {
        return MAP_EDITOR_RESOURCES.some((r) => canManage(r));
      }
      const resource = pageResource(p);
      return resource ? canView(resource) : false;
    };
  }, [canView, canManage]);

  const visibleGroups = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => canViewPage(item.page)),
    })).filter((group) => {
      // "Medya" gibi tek sayfali gruplarda gorunurluk o sayfanin kendi
      // iznine bagli; digerlerinde ise altinda gorulebilir en az bir alt
      // sekme kalmadiysa grup basligi bos halde gosterilmemeli.
      if (group.headingPage) return canViewPage(group.headingPage);
      return group.items.length > 0;
    });
  }, [canViewPage]);

  // Arama bosken normal ac/kapa (collapsedGroups) durumu gecerli. Arama
  // yapilirken eslesen gruplar - baslik eslesiyorsa tum alt sekmeleriyle,
  // sadece bazi alt sekmeler eslesiyorsa yalnizca onlarla - her zaman acik
  // gosterilir, eslesmeyen gruplar tamamen gizlenir.
  const displayGroups = useMemo(() => {
    const q = sidebarArama.trim().toLocaleLowerCase('tr-TR');
    if (!q) {
      return visibleGroups.map((group) => ({
        ...group,
        expanded: !collapsedGroups.has(group.heading),
      }));
    }
    return visibleGroups
      .map((group) => {
        const headingMatch = group.heading.toLocaleLowerCase('tr-TR').includes(q);
        const items = headingMatch
          ? group.items
          : group.items.filter((item) =>
              item.label.toLocaleLowerCase('tr-TR').includes(q),
            );
        return { ...group, items, expanded: true, eslesiyor: headingMatch || items.length > 0 };
      })
      .filter((group) => group.eslesiyor);
  }, [visibleGroups, sidebarArama, collapsedGroups]);

  useEffect(() => {
    if (!user) return;
    if (page && canViewPage(page)) return;
    const firstVisible =
      visibleGroups.flatMap((g) =>
        g.headingPage ? [g.headingPage] : g.items.map((i) => i.page),
      )[0] ?? null;
    setPage(firstVisible);
  }, [user, page, canViewPage, visibleGroups]);

  useEffect(() => {
    if (page) localStorage.setItem(SAYFA_DEPOLAMA_ANAHTARI, page);
  }, [page]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      setPage(null);
      localStorage.removeItem(SAYFA_DEPOLAMA_ANAHTARI);
    }
  }

  if (!authChecked) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="topbar-brand-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2 2 7v2h20V7L12 2Z M4 10v9H2v2h20v-2h-2v-9h-2v9h-3v-9h-2v9H9v-9H7v9H4v-9Z"
                fill="currentColor"
              />
            </svg>
          </span>
          Kapaklı Belediyesi
        </div>

        <div className="sidebar-search-row">
          <input
            type="search"
            value={sidebarArama}
            onChange={(e) => setSidebarArama(e.target.value)}
            placeholder="Menüde ara..."
            className="sidebar-search-input"
          />
        </div>

        <nav className="sidebar-nav">
          {displayGroups.length === 0 && (
            <p className="sidebar-empty-note">Eşleşen bir menü bulunamadı.</p>
          )}
          {displayGroups.map((group) => {
            const canToggle = !group.headingPage && group.items.length > 0;
            return (
              <div className="sidebar-group" key={group.heading}>
                {group.headingPage ? (
                  <button
                    className={
                      'sidebar-group-heading-link' +
                      (page === group.headingPage ? ' active' : '')
                    }
                    onClick={() => setPage(group.headingPage!)}
                  >
                    {group.heading}
                  </button>
                ) : canToggle ? (
                  <button
                    className="sidebar-group-heading sidebar-group-heading-toggle"
                    onClick={() => toggleGroup(group.heading)}
                  >
                    {group.heading}
                    <span className="sidebar-group-chevron" aria-hidden="true">
                      {group.expanded ? '▾' : '▸'}
                    </span>
                  </button>
                ) : (
                  <div className="sidebar-group-heading">{group.heading}</div>
                )}
                {group.expanded &&
                  group.items.map((item) => (
                    <button
                      key={item.page}
                      className={
                        'sidebar-link' + (page === item.page ? ' active' : '')
                      }
                      onClick={() => setPage(item.page)}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="user-info-text">
            {user.email} &middot; {user.role.name}
          </span>
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </aside>
      <main>
        {page === 'haberler' && <HaberlerPage canManage={canManage('haberler')} />}
        {page === 'announcements' && <AnnouncementsPage canManage={canManage('announcements')} />}
        {page === 'ilanlar' && <IlanlarPage canManage={canManage('ilanlar')} />}
        {page === 'ihaleler' && <IhalelerPage canManage={canManage('ihaleler')} />}
        {page === 'makaleler' && <MakalelerPage canManage={canManage('makaleler')} />}
        {page === 'meclisGundemleri' && (
          <MeclisGundemleriPage canManage={canManage('meclisGundemleri')} />
        )}
        {page === 'baskan' && <BaskanPage canManage={canManage('baskan')} />}
        {page === 'hakkimizda' && <HakkimizdaPage canManage={canManage('hakkimizda')} />}
        {page === 'yardimMerkezi' && (
          <YardimMerkeziPage canManage={canManage('yardimMerkezi')} />
        )}
        {page === 'bizeUlasin' && <BizeUlasinPage canManage={canManage('bizeUlasin')} />}
        {page === 'faturaOdeme' && <FaturaOdemePage canManage={canManage('faturaOdeme')} />}
        {page === 'ulasimHizmetleri' && (
          <UlasimHatlariPage canManage={canManage('ulasimHatlari')} />
        )}
        {page === 'atikRehberi' && (
          <AtikRehberiPage canManage={canManage('atikRehberi')} />
        )}
        {page === 'temaAyarlari' && (
          <TemaAyarlariPage canManage={canManage('temaAyarlari')} />
        )}
        {page === 'panelTemasi' && (
          <PanelTemasiPage canManage={canManage('panelTemasi')} />
        )}
        {page === 'medya' && <MedyaPage canManage={canManage('medya')} />}
        {page === 'atikNoktalari' && <AtikNoktalariPage canManage={canManage('atikNoktalari')} />}
        {page === 'appointments' && <AppointmentsPage canManage={canManage('appointments')} />}
        {page === 'requests' && <RequestsPage canManage={canManage('requests')} />}
        {page === 'pharmacies' && <PharmaciesPage canManage={canManage('pharmacies')} />}
        {page === 'meclisKararlari' && (
          <MeclisKararlariPage canManage={canManage('meclisKararlari')} />
        )}
        {page === 'vefatEdenler' && <VefatEdenlerPage canManage={canManage('vefatEdenler')} />}
        {page === 'wifiNoktalari' && <WifiNoktalariPage canManage={canManage('wifiNoktalari')} />}
        {page === 'suHizmetleri' && <SuHizmetleriPage canManage={canManage('suHizmetleri')} />}
        {page === 'fenIsleri' && <FenIsleriPage canManage={canManage('kaziCalismalari')} />}
        {page === 'elektrik' && <ElektrikPage canManage={canManage('elektrikKesintileri')} />}
        {page === 'asevi' && <AseviPage canManage={canManage('asevi')} />}
        {page === 'camiler' && <CamilerPage canManage={canManage('camiler')} />}
        {page === 'onemliKurumlar' && (
          <OnemliKurumlarPage canManage={canManage('onemliKurumlar')} />
        )}
        {page === 'parklar' && <ParklarPage canManage={canManage('parklar')} />}
        {page === 'tarihiYerler' && <TarihiYerlerPage canManage={canManage('tarihiYerler')} />}
        {page === 'formlar' && <FormlarPage canManage={canManage('formlar')} />}
        {page === 'basvuruHizmetleri' && (
          <BasvuruHizmetleriPage canManage={canManage('basvuruHizmetleri')} />
        )}
        {page === 'basvuruTurleri' && (
          <BasvuruTurleriPage canManage={canManage('basvuruTurleri')} />
        )}
        {page === 'basvurular' && (
          <BasvurularPage canManage={canManage('basvurular')} />
        )}
        {page === 'mapEditor' && (
          <MapEditorPage canManage={MAP_EDITOR_RESOURCES.some((r) => canManage(r))} />
        )}
        {page === 'users' && <UsersPage canManage={canManage('users')} />}
        {page === 'roles' && <RolesPage canManage={canManage('roles')} />}
        {page === 'adminUsers' && <AdminUsersPage canManage={canManage('adminUsers')} />}
        {page === 'notifications' && (
          <NotificationsPage canManage={canManage('notifications')} />
        )}
      </main>
    </div>
  );
}

export default App;
