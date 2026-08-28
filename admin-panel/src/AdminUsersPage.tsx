import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  getRoles,
  updateAdminUser,
} from './api';
import type { AdminAccountInput, AdminAccountUpdateInput } from './api';
import type { AdminAccount, AdminRole } from './types';

interface Props {
  canManage: boolean;
}

const emptyCreateForm: AdminAccountInput = {
  email: '',
  password: '',
  ad: '',
  roleId: '',
};

const emptyEditForm: AdminAccountUpdateInput & { password: string } = {
  ad: '',
  roleId: '',
  disabled: false,
  password: '',
};

function AdminUsersPage({ canManage }: Props) {
  const [users, setUsers] = useState<AdminAccount[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AdminAccountInput>(emptyCreateForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([getAdminUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
      if (!form.roleId && rolesData.length > 0) {
        setForm((f) => ({ ...f, roleId: rolesData[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createAdminUser(form);
      setForm({ ...emptyCreateForm, roleId: roles[0]?.id ?? '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı');
    }
  }

  function startEdit(user: AdminAccount) {
    setEditingId(user.id);
    setEditForm({ ad: user.ad ?? '', roleId: user.roleId, disabled: user.disabled, password: '' });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      const { password, ...rest } = editForm;
      const payload = password ? { ...rest, password } : rest;
      await updateAdminUser(id, payload);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı güncellenemedi');
    }
  }

  async function handleToggleDisabled(user: AdminAccount) {
    setError(null);
    try {
      await updateAdminUser(user.id, { disabled: !user.disabled });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu kullanıcı silinsin mi?')) return;
    setError(null);
    try {
      await deleteAdminUser(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Yönetici Kullanıcılar</h2>
      <p>Admin panele giriş yapabilen personel hesapları ve rolleri.</p>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Kullanıcı</h3>
          <label>
            E-posta
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Ad Soyad
            <input
              value={form.ad}
              onChange={(e) => setForm({ ...form, ad: e.target.value })}
            />
          </label>
          <label>
            Şifre
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Rol
            <select
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              required
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Kaydet</button>
        </form>
      )}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>E-posta</th>
              <th>Ad Soyad</th>
              <th>Rol</th>
              <th>Durum</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) =>
              editingId === user.id ? (
                <tr key={user.id}>
                  <td colSpan={canManage ? 5 : 4}>
                    <div className="edit-row">
                      <label>
                        Ad Soyad
                        <input
                          value={editForm.ad}
                          onChange={(e) => setEditForm({ ...editForm, ad: e.target.value })}
                        />
                      </label>
                      <label>
                        Rol
                        <select
                          value={editForm.roleId}
                          onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value })}
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Yeni Şifre (opsiyonel)
                        <input
                          type="password"
                          value={editForm.password}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                          placeholder="Değiştirmek istemiyorsanız boş bırakın"
                        />
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editForm.disabled}
                          onChange={(e) =>
                            setEditForm({ ...editForm, disabled: e.target.checked })
                          }
                        />
                        Pasif (giriş yapamaz)
                      </label>
                      <div className="row-actions">
                        <button type="button" onClick={() => handleUpdate(user.id)}>
                          Kaydet
                        </button>
                        <button
                          type="button"
                          className="btn-neutral"
                          onClick={() => setEditingId(null)}
                        >
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.ad ?? '—'}</td>
                  <td>{user.roleName}</td>
                  <td>{user.disabled ? 'Pasif' : 'Aktif'}</td>
                  {canManage && (
                    <td className="row-actions">
                      <button type="button" onClick={() => startEdit(user)}>
                        Düzenle
                      </button>
                      <button
                        type="button"
                        className="btn-neutral"
                        onClick={() => handleToggleDisabled(user)}
                      >
                        {user.disabled ? 'Aktif Et' : 'Pasife Al'}
                      </button>
                      <button type="button" onClick={() => handleDelete(user.id)}>
                        Sil
                      </button>
                    </td>
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUsersPage;
