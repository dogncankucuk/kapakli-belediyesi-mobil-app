import { useEffect, useMemo, useRef } from 'react';
import { NAV_GROUPS, pageResource } from './navGroups';
import type { ResourceAction, ResourcePermission } from './types';

type MatrixState = Record<string, { list: boolean; manage: boolean }>;

interface YetkiGrubu {
  heading: string;
  resources: string[];
}

// Sidebar'daki NAV_GROUPS ile birebir ayni gruplama - kullanici/departman
// yetkileri ~37 kaynagi tek tek degil, bu ana basliklara gore yonetir.
const YETKI_GRUPLARI: YetkiGrubu[] = (() => {
  const bazGruplar = NAV_GROUPS.map((group) => {
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

  // "Medya Klasörleri" (klasör oluşturma/silme) bilerek NAV_GROUPS'ta yer
  // almıyor - ayrı bir sidebar sayfası değil, "Medya" sayfasının içindeki
  // dar kapsamlı bir alt yetki. Medya satırının hemen altına ekleniyor.
  const medyaIndex = bazGruplar.findIndex((grup) => grup.heading === 'Medya');
  const klasorGrubu: YetkiGrubu = {
    heading: 'Medya Klasörleri',
    resources: ['medyaKlasorleri'],
  };
  if (medyaIndex === -1) return [...bazGruplar, klasorGrubu];
  return [
    ...bazGruplar.slice(0, medyaIndex + 1),
    klasorGrubu,
    ...bazGruplar.slice(medyaIndex + 1),
  ];
})();

function permissionsToMatrix(permissions: ResourcePermission[]): MatrixState {
  const matrix: MatrixState = {};
  for (const grant of permissions) {
    const hasView = grant.actions.includes('list') || grant.actions.includes('show');
    const hasManage =
      grant.actions.includes('create') ||
      grant.actions.includes('edit') ||
      grant.actions.includes('delete');
    matrix[grant.resource] = { list: hasView, manage: hasManage };
  }
  return matrix;
}

function matrixToPermissions(matrix: MatrixState): ResourcePermission[] {
  const permissions: ResourcePermission[] = [];
  for (const grup of YETKI_GRUPLARI) {
    for (const resource of grup.resources) {
      const durum = matrix[resource];
      if (!durum || (!durum.list && !durum.manage)) continue;
      const actions: ResourceAction[] = [];
      if (durum.list || durum.manage) actions.push('list', 'show');
      if (durum.manage) actions.push('create', 'edit', 'delete');
      permissions.push({ resource, actions });
    }
  }
  return permissions;
}

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
  disabled,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

interface Props {
  value: ResourcePermission[];
  onChange: (permissions: ResourcePermission[]) => void;
  disabled?: boolean;
}

// Kullanici duzenleme formunda (AdminUsersPage) VE departman varsayilan
// yetki sablonunda (aynı sayfa) kullanilan paylasilan izin matrisi -
// tamamen "value" prop'undan turetilir, kendi ic state'i yoktur.
function YetkiMatrisEditor({ value, onChange, disabled }: Props) {
  const matrix = useMemo(() => permissionsToMatrix(value), [value]);

  function toggleGrup(resources: string[], seviye: 'list' | 'manage') {
    const { checked } = grupDurumu(matrix, resources, seviye);
    const yeniDeger = !checked;
    const next: MatrixState = { ...matrix };
    for (const resource of resources) {
      const mevcut = next[resource] ?? { list: false, manage: false };
      const guncel = { ...mevcut, [seviye]: yeniDeger };
      if (seviye === 'manage' && guncel.manage) guncel.list = true;
      if (seviye === 'list' && !guncel.list) guncel.manage = false;
      next[resource] = guncel;
    }
    onChange(matrixToPermissions(next));
  }

  return (
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
                    disabled={disabled}
                  />
                </td>
                <td>
                  <GrupCheckbox
                    checked={manageDurum.checked}
                    indeterminate={manageDurum.indeterminate}
                    onChange={() => toggleGrup(grup.resources, 'manage')}
                    disabled={disabled}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default YetkiMatrisEditor;
