import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { createRole, deleteRole, getRoles, updateRole } from './api';
import type { RoleInput } from './api';
import type { AdminRole, ResourceAction } from './types';
import { RESOURCE_LABELS, RESOURCE_ORDER } from './types';

interface Props {
  canManage: boolean;
}

type MatrixState = Record<string, { list: boolean; manage: boolean }>;

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

  function toggle(resource: string, level: 'list' | 'manage') {
    setMatrix((prev) => {
      const current = prev[resource];
      const next = { ...current, [level]: !current[level] };
      // "Yönet" acilirsa "Goruntule" de otomatik acilir - yonetim
      // goruntuleme olmadan anlamsiz.
      if (level === 'manage' && next.manage) next.list = true;
      if (level === 'list' && !next.list) next.manage = false;
      return { ...prev, [resource]: next };
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

  const matrixRows = useMemo(() => RESOURCE_ORDER, []);

  return (
    <div className="page">
      <h2>Roller</h2>
      <p>
        Her rol için hangi bölümlerin "görüntülenebileceğini" ve hangilerinin
        "yönetilebileceğini" (ekleme/düzenleme/silme) buradan belirleyin.
      </p>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form role-form" onSubmit={handleSubmit}>
          <h3>{isEditing ? `Rolü Düzenle: ${name}` : 'Yeni Rol'}</h3>
          <label>
            Rol Adı
            <input value={name} onChange={(e) => setName(e.target.value)} required />
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
                {matrixRows.map((resource) => (
                  <tr key={resource}>
                    <td>{RESOURCE_LABELS[resource] ?? resource}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={matrix[resource].list}
                        onChange={() => toggle(resource, 'list')}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={matrix[resource].manage}
                        onChange={() => toggle(resource, 'manage')}
                      />
                    </td>
                  </tr>
                ))}
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
