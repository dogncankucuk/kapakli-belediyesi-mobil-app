import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { createRole, deleteRole, getRoles, updateRole } from './api';
import type { RoleInput } from './api';
import { NAV_GROUPS, pageResource } from './navGroups';
import type { AdminRole, ResourceAction } from './types';
import { RESOURCE_ORDER } from './types';

interface Props {
  canManage: boolean;
}

type MatrixState = Record<string, { list: boolean; manage: boolean }>;

interface YetkiGrubu {
  heading: string;
  resources: string[];
}

// Sidebar'daki NAV_GROUPS ile birebir ayni gruplama - roller artik ~37
// kaynagi tek tek degil, bu ana basliklara gore yonetiyor (kullanicinin
// istegi: "her alt baslik icin ayri ayri yetkilendirmeye gerek yok").
// asevi ve basvuruHizmetleri kaynaklarinin NAV_GROUPS'ta hicbir ogesi yok
// (Asevi nav'dan kasitli kaldirilmisti, bkz. App.tsx yorumu) - sidebar'dan
// zaten erisilemedikleri icin bu tabloda da yer almiyorlar; var olan
// rollerdeki eski izinleri sessizce korur (matrixToPermissions asagida
// RESOURCE_ORDER'in tamamini yazmaya devam eder, sadece bu ikisi icin UI yok).
const YETKI_GRUPLARI: YetkiGrubu[] = NAV_GROUPS.map((group) => {
  const resources = new Set<string>();
  if (group.headingPage) {
    const resource = pageResource(group.headingPage);
    if (resource) resources.add(resource);
  }
  for (const item of group.items) {
    const resource = pageResource(item.page);
    if (resource) resources.add(resource);
  }
  return { heading: group.heading, resources: Array.from(resources) };
}).filter((grup) => grup.resources.length > 0);

function grupDurumu(
  matrix: MatrixState,
  resources: string[],
  seviye: 'list' | 'manage',
): { checked: boolean; indeterminate: boolean } {
  const degerler = resources.map((r) => matrix[r]?.[seviye] ?? false);
  const hepsi = degerler.length > 0 && degerler.every(Boolean);
  const herhangi = degerler.some(Boolean);
  return { checked: hepsi, indeterminate: herhangi && !hepsi };
}

function GrupCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} />;
}

function emptyMatrix(): MatrixState {
  const matrix: MatrixState = {};
  for (const resource of RESOURCE_ORDER) {
    matrix[resource] = { list: false, manage: false };
  }
  return matrix;
}

function matrixFromRole(role: AdminRole): MatrixState {
  const matrix = emptyMatrix();
  for (const grant of role.permissions) {
    const hasView = grant.actions.includes('list') || grant.actions.includes('show');
    const hasManage =
      grant.actions.includes('create') ||
      grant.actions.includes('edit') ||
      grant.actions.includes('delete');
    matrix[grant.resource] = { list: hasView, manage: hasManage };
  }
  return matrix;
}

function matrixToPermissions(matrix: MatrixState): RoleInput['permissions'] {
  const permissions: RoleInput['permissions'] = [];
  for (const resource of RESOURCE_ORDER) {
    const { list, manage } = matrix[resource];
    if (!list && !manage) continue;
    const actions: ResourceAction[] = [];
    if (list || manage) actions.push('list', 'show');
    if (manage) actions.push('create', 'edit', 'delete');
    permissions.push({ resource, actions });
  }
  return permissions;
}

function RolesPage({ canManage }: Props) {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [matrix, setMatrix] = useState<MatrixState>(emptyMatrix());

  const isEditing = editingId !== null;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRoles(await getRoles());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Roller yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setMatrix(emptyMatrix());
  }

  function startEdit(role: AdminRole) {
    setEditingId(role.id);
    setName(role.name);
    setMatrix(matrixFromRole(role));
  }

  function toggleGrup(resources: string[], seviye: 'list' | 'manage') {
    setMatrix((prev) => {
      const { checked } = grupDurumu(prev, resources, seviye);
      // Kismi (indeterminate) ya da tamamen kapaliysa hepsini ac, hepsi
      // acikken tiklanirsa hepsini kapat - standart "tumunu sec" davranisi.
      const yeniDeger = !checked;
      const next = { ...prev };
      for (const resource of resources) {
        const mevcut = next[resource] ?? { list: false, manage: false };
        const guncel = { ...mevcut, [seviye]: yeniDeger };
        // "Yönet" acilirsa "Goruntule" de otomatik acilir - yonetim
        // goruntuleme olmadan anlamsiz.
        if (seviye === 'manage' && guncel.manage) guncel.list = true;
        if (seviye === 'list' && !guncel.list) guncel.manage = false;
        next[resource] = guncel;
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: RoleInput = { name, permissions: matrixToPermissions(matrix) };
    try {
      if (isEditing) {
        await updateRole(editingId!, payload);
      } else {
        await createRole(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rol kaydedilemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu rol silinsin mi?')) return;
    setError(null);
    try {
      await deleteRole(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rol silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Roller</h2>
      <p>
        Her rol için sidebar'daki ana başlıklara göre hangilerinin
        "görüntülenebileceğini" ve hangilerinin "yönetilebileceğini"
        (ekleme/düzenleme/silme) buradan belirleyin.
      </p>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form role-form" onSubmit={handleSubmit}>
          <h3>{isEditing ? `Rolü Düzenle: ${name}` : 'Yeni Rol'}</h3>
          <label>
            Rol Adı
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Lütfen veri girişi yapınız" />
          </label>

          <div className="permission-matrix-wrap">
            <table className="permission-matrix">
              <thead>
                <tr>
                  <th>Bölüm</th>
                  <th>Görüntüle</th>
                  <th>Yönet</th>
                </tr>
              </thead>
              <tbody>
                {YETKI_GRUPLARI.map((grup) => {
                  const listDurum = grupDurumu(matrix, grup.resources, 'list');
                  const manageDurum = grupDurumu(matrix, grup.resources, 'manage');
                  return (
                    <tr key={grup.heading}>
                      <td>{grup.heading}</td>
                      <td>
                        <GrupCheckbox
                          checked={listDurum.checked}
                          indeterminate={listDurum.indeterminate}
                          onChange={() => toggleGrup(grup.resources, 'list')}
                        />
                      </td>
                      <td>
                        <GrupCheckbox
                          checked={manageDurum.checked}
                          indeterminate={manageDurum.indeterminate}
                          onChange={() => toggleGrup(grup.resources, 'manage')}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="row-actions">
            <button type="submit">{isEditing ? 'Güncelle' : 'Oluştur'}</button>
            {isEditing && (
              <button type="button" className="btn-neutral" onClick={resetForm}>
                Vazgeç
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Tür</th>
              <th>Kullanıcı Sayısı</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td>{role.isFullAccess ? 'Tam Yetkili (Sistem)' : 'Özel'}</td>
                <td>{role.userCount}</td>
                {canManage && (
                  <td className="row-actions">
                    {!role.isProtected && (
                      <button type="button" onClick={() => startEdit(role)}>
                        Düzenle
                      </button>
                    )}
                    {!role.isProtected && (
                      <button type="button" onClick={() => handleDelete(role.id)}>
                        Sil
                      </button>
                    )}
                    {role.isProtected && (
                      <span className="map-editor-readonly-note">Korumalı</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RolesPage;
