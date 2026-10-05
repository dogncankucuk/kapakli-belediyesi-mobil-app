import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createAdminUser,
  createDepartman,
  deleteAdminUser,
  deleteDepartman,
  getAdminUsers,
  getDepartmanlar,
  updateAdminUser,
} from './api';
import type { AdminAccountInput, AdminAccountUpdateInput } from './api';
import type { AdminAccount, Departman, ResourcePermission } from './types';
import YetkiMatrisEditor from './YetkiMatrisEditor';

interface Props {
  canManage: boolean;
}

const emptyCreateForm: Omit<AdminAccountInput, 'isFullAccess' | 'permissions'> = {
  email: '',
  password: '',
  ad: '',
  departmanId: '',
};

const emptyEditForm: Omit<AdminAccountUpdateInput, 'isFullAccess' | 'permissions'> & {
  password: string;
} = {
  ad: '',
  departmanId: '',
  disabled: false,
  password: '',
};

function AdminUsersPage({ canManage }: Props) {
  const [users, setUsers] = useState<AdminAccount[]>([]);
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createFormAcik, setCreateFormAcik] = useState(false);
  const [form, setForm] = useState(emptyCreateForm);
  const [formIsFullAccess, setFormIsFullAccess] = useState(false);
  const [formPermissions, setFormPermissions] = useState<ResourcePermission[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editIsFullAccess, setEditIsFullAccess] = useState(false);
  const [editPermissions, setEditPermissions] = useState<ResourcePermission[]>([]);

  const [departmanFormAcik, setDepartmanFormAcik] = useState(false);
  const [yeniDepartmanAdi, setYeniDepartmanAdi] = useState('');
  const [yeniDepartmanYetkiler, setYeniDepartmanYetkiler] = useState<ResourcePermission[]>([]);
  const [departmanError, setDepartmanError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [usersData, departmanlarData] = await Promise.all([
        getAdminUsers(),
        getDepartmanlar(),
      ]);
      setUsers(usersData);
      setDepartmanlar(departmanlarData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  function resetCreateForm() {
    setForm(emptyCreateForm);
    setFormIsFullAccess(false);
    setFormPermissions([]);
    setCreateFormAcik(false);
  }

  function handleFormDepartmanChange(depId: string) {
    const dep = departmanlar.find((d) => d.id === depId);
    setForm({ ...form, departmanId: depId });
    setFormPermissions(dep?.varsayilanYetkiler ?? []);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createAdminUser({
        ...form,
        departmanId: form.departmanId || undefined,
        isFullAccess: formIsFullAccess,
        permissions: formIsFullAccess ? undefined : formPermissions,
      });
      resetCreateForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı');
    }
  }

  function startEdit(user: AdminAccount) {
    setEditingId(user.id);
    setEditForm({
      ad: user.ad ?? '',
      departmanId: user.departmanId ?? '',
      disabled: user.disabled,
      password: '',
    });
    setEditIsFullAccess(user.isFullAccess);
    setEditPermissions(user.permissions);
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      const { password, ...rest } = editForm;
      await updateAdminUser(id, {
        ...rest,
        departmanId: rest.departmanId || null,
        isFullAccess: editIsFullAccess,
        permissions: editIsFullAccess ? undefined : editPermissions,
        ...(password ? { password } : {}),
      });
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

  async function handleDepartmanEkle(e: FormEvent) {
    e.preventDefault();
    const ad = yeniDepartmanAdi.trim();
    if (!ad) return;
    setDepartmanError(null);
    try {
      await createDepartman(ad, yeniDepartmanYetkiler);
      setYeniDepartmanAdi('');
      setYeniDepartmanYetkiler([]);
      setDepartmanFormAcik(false);
      await load();
    } catch (err) {
      setDepartmanError(err instanceof Error ? err.message : 'Departman oluşturulamadı');
    }
  }

  async function handleDepartmanSil(id: string) {
    if (!confirm('Bu departman silinsin mi?')) return;
    setDepartmanError(null);
    try {
      await deleteDepartman(id);
      await load();
    } catch (err) {
      setDepartmanError(err instanceof Error ? err.message : 'Departman silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Kullanıcılar ve Yetkiler</h2>
      <p>
        Admin panele giriş yapabilen personel hesaplarını, yetkilerini ve
        departmanlarını buradan yönetin. Her kullanıcının kendine özel bir
        yetki seti vardır (rol paylaşımı yok) - "Tam Yetkili" işaretlenirse
        kullanıcı tüm bölümlere erişir.
      </p>
      {error && <p className="error-message">{error}</p>}

      {canManage && !createFormAcik && (
        <button
          type="button"
          className="medya-klasor-yeni-ac"
          onClick={() => setCreateFormAcik(true)}
        >
          + Yeni Kullanıcı Oluştur
        </button>
      )}

      {canManage && createFormAcik && (
        <form className="inline-form role-form" onSubmit={handleCreate}>
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
            Departman (opsiyonel)
            <select
              value={form.departmanId ?? ''}
              onChange={(e) => handleFormDepartmanChange(e.target.value)}
            >
              <option value="">Departman seçilmedi</option>
              {departmanlar.map((departman) => (
                <option key={departman.id} value={departman.id}>
                  {departman.ad}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formIsFullAccess}
              onChange={(e) => setFormIsFullAccess(e.target.checked)}
            />
            Tam Yetkili (Süper Admin - tüm bölümlere erişir)
          </label>
          {!formIsFullAccess && (
            <YetkiMatrisEditor value={formPermissions} onChange={setFormPermissions} />
          )}
          <div className="row-actions">
            <button type="submit">Oluştur</button>
            <button type="button" className="btn-neutral" onClick={resetCreateForm}>
              Vazgeç
            </button>
          </div>
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
              <th>Departman</th>
              <th>Tam Yetkili</th>
              <th>Durum</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) =>
              editingId === user.id ? (
                <tr key={user.id}>
                  <td colSpan={canManage ? 6 : 5}>
                    <div className="edit-row">
                      <label>
                        Ad Soyad
                        <input
                          value={editForm.ad}
                          onChange={(e) => setEditForm({ ...editForm, ad: e.target.value })}
                        />
                      </label>
                      <label>
                        Departman (opsiyonel)
                        <select
                          value={editForm.departmanId ?? ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, departmanId: e.target.value })
                          }
                        >
                          <option value="">Departman seçilmedi</option>
                          {departmanlar.map((departman) => (
                            <option key={departman.id} value={departman.id}>
                              {departman.ad}
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
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editIsFullAccess}
                          onChange={(e) => setEditIsFullAccess(e.target.checked)}
                        />
                        Tam Yetkili (Süper Admin - tüm bölümlere erişir)
                      </label>
                      {!editIsFullAccess && (
                        <YetkiMatrisEditor value={editPermissions} onChange={setEditPermissions} />
                      )}
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
                  <td>{user.departmanAdi ?? '—'}</td>
                  <td>{user.isFullAccess ? 'Evet' : 'Hayır'}</td>
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

      <h2>Departmanlar</h2>
      <p>
        Personelin hangi birimde çalıştığını belirtir. Bir departman
        oluştururken belirlenen yetkiler, o departman seçildiğinde yeni
        kullanıcı formunda öneri olarak doldurulur (kullanıcı bazında
        değiştirilebilir). Medya klasörleri de görünürlük için departmana
        göre kısıtlanabilir.
      </p>
      {departmanError && <p className="error-message">{departmanError}</p>}

      {canManage && !departmanFormAcik && (
        <button
          type="button"
          className="medya-klasor-yeni-ac"
          onClick={() => setDepartmanFormAcik(true)}
        >
          + Yeni Departman Oluştur
        </button>
      )}

      {canManage && departmanFormAcik && (
        <form className="inline-form role-form" onSubmit={handleDepartmanEkle}>
          <h3>Yeni Departman</h3>
          <label>
            Departman Adı
            <input
              value={yeniDepartmanAdi}
              onChange={(e) => setYeniDepartmanAdi(e.target.value)}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <p className="map-editor-readonly-note">
            Bu departmana atanacak kullanıcılar için önerilen (varsayılan)
            yetkiler:
          </p>
          <YetkiMatrisEditor value={yeniDepartmanYetkiler} onChange={setYeniDepartmanYetkiler} />
          <div className="row-actions">
            <button type="submit">Oluştur</button>
            <button
              type="button"
              className="btn-neutral"
              onClick={() => {
                setDepartmanFormAcik(false);
                setYeniDepartmanAdi('');
                setYeniDepartmanYetkiler([]);
              }}
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Ad</th>
            <th>Kullanıcı Sayısı</th>
            {canManage && <th>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {departmanlar.map((departman) => (
            <tr key={departman.id}>
              <td>{departman.ad}</td>
              <td>{departman.kullaniciSayisi}</td>
              {canManage && (
                <td className="row-actions">
                  <button type="button" onClick={() => handleDepartmanSil(departman.id)}>
                    Sil
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsersPage;
