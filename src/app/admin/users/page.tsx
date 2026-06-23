'use client';
import { useEffect, useState } from 'react';
import { Search, MoreHorizontal, Filter, Download, Plus, X, KeyRound, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type UserProfile = {
  user_id: string;
  email: string;
  full_name: string | null;
  nric: string | null;
  phone: string | null;
  address_line: string | null;
  postcode: string | null;
  city: string | null;
  state: string | null;
  is_admin: boolean;
  meta: { status?: 'verified' | 'pending' | 'suspended' } | null;
  created_at: string;
};

type ModalMode = null | 'create' | 'edit' | 'delete' | 'reset';

const emptyForm = {
  email: '', full_name: '', nric: '', phone: '',
  address_line: '', postcode: '', city: '', state: '', password: '',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all');

  const [modal, setModal] = useState<ModalMode>(null);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal memuatkan pengguna.');
      setUsers(json.data ?? []);
    } catch (e: any) {
      toast.error(e.message ?? 'Gagal memuatkan pengguna.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter((u) => {
    const status = u.meta?.status ?? 'pending';
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.nric ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q)
    );
  });

  function openCreate() {
    setForm(emptyForm);
    setActiveUser(null);
    setModal('create');
  }

  function openEdit(u: UserProfile) {
    setForm({
      email: u.email ?? '', full_name: u.full_name ?? '', nric: u.nric ?? '',
      phone: u.phone ?? '', address_line: u.address_line ?? '',
      postcode: u.postcode ?? '', city: u.city ?? '', state: u.state ?? '', password: '',
    });
    setActiveUser(u);
    setModal('edit');
  }

  function openDelete(u: UserProfile) {
    setActiveUser(u);
    setModal('delete');
  }

  function openReset(u: UserProfile) {
    setActiveUser(u);
    setTempPassword(null);
    setModal('reset');
  }

  function closeModal() {
    setModal(null);
    setActiveUser(null);
    setTempPassword(null);
  }

  async function handleCreateSubmit() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal mencipta pengguna.');
      toast.success('Pengguna baharu berjaya dicipta.');
      closeModal();
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit() {
    if (!activeUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${activeUser.user_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name, nric: form.nric, phone: form.phone,
          address_line: form.address_line, postcode: form.postcode,
          city: form.city, state: form.state,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal mengemas kini pengguna.');
      toast.success('Maklumat pengguna dikemas kini.');
      closeModal();
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!activeUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${activeUser.user_id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal memadam pengguna.');
      toast.success(`${activeUser.full_name} telah dipadam.`);
      closeModal();
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(mode: 'set' | 'link') {
    if (!activeUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${activeUser.user_id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal menetapkan semula kata laluan.');
      if (mode === 'set') {
        setTempPassword(json.tempPassword);
      } else {
        toast.success(`Pautan tetapan semula dihantar ke ${json.email}.`);
        closeModal();
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    const rows = filtered.map(u => ({
      nama: u.full_name, emel: u.email, nric: u.nric, telefon: u.phone,
      status: u.meta?.status ?? 'pending', didaftar: u.created_at,
    }));
    const headers = Object.keys(rows[0] ?? { nama: '', emel: '', nric: '', telefon: '', status: '', didaftar: '' });
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r as any)[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pengguna-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Fail CSV berjaya dieksport.');
  }

  function statusBadge(status?: string) {
    if (status === 'verified') return <span className="badge badge-green">Disahkan</span>;
    if (status === 'suspended') return <span className="badge badge-red">Digantung</span>;
    return <span className="badge badge-gold">Menunggu</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, emel atau no. kad pengenalan..."
            style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ padding: '10px 14px', background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: 10, color: '#fff' }}
          >
            <option value="all">Semua status</option>
            <option value="verified">Disahkan</option>
            <option value="pending">Menunggu</option>
            <option value="suspended">Digantung</option>
          </select>
          <button onClick={handleExport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
            <Download size={16} /> Eksport CSV
          </button>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--gold)', color: 'var(--navy)', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={16} /> Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--navy-mid)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pemohon</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No. Kad Pengenalan</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tarikh Daftar</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', width: 140 }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ padding: 24, color: 'var(--text-muted)' }}>Memuatkan...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, color: 'var(--text-muted)' }}>Tiada pengguna ditemui.</td></tr>
            )}
            {!loading && filtered.map((user) => (
              <tr key={user.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.full_name ?? '—'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {user.nric ?? '—'}
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {statusBadge(user.meta?.status)}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button onClick={() => openEdit(user)} title="Edit" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => openReset(user)} title="Tetapkan semula kata laluan" style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', padding: 4 }}>
                      <KeyRound size={16} />
                    </button>
                    <button onClick={() => openDelete(user)} title="Padam" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal: Create / Edit ── */}
      {(modal === 'create' || modal === 'edit') && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{modal === 'create' ? 'Tambah Pengguna' : 'Kemas Kini Pengguna'}</h3>
              <button onClick={closeModal} style={iconBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 20px' }}>
              <Field label="Nama Penuh" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
              <Field label="Emel" value={form.email} onChange={(v) => setForm({ ...form, email: v })} disabled={modal === 'edit'} />
              <Field label="No. Kad Pengenalan" value={form.nric} onChange={(v) => setForm({ ...form, nric: v })} />
              <Field label="No. Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Alamat" value={form.address_line} onChange={(v) => setForm({ ...form, address_line: v })} />
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Poskod" value={form.postcode} onChange={(v) => setForm({ ...form, postcode: v })} />
                <Field label="Bandar" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="Negeri" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
              </div>
              {modal === 'create' && (
                <Field label="Kata Laluan Sementara" value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
              )}
            </div>
            <div style={modalFooterStyle}>
              <button onClick={closeModal} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Batal</button>
              <button
                onClick={modal === 'create' ? handleCreateSubmit : handleEditSubmit}
                disabled={saving}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--gold)', color: 'var(--navy)', fontWeight: 700, cursor: 'pointer' }}
              >
                {saving ? 'Menyimpan...' : modal === 'create' ? 'Cipta Pengguna' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete confirm ── */}
      {modal === 'delete' && activeUser && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: 420 }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Padam Pengguna</h3>
              <button onClick={closeModal} style={iconBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>
              Adakah anda pasti mahu memadam <strong>{activeUser.full_name}</strong>? Tindakan ini tidak dapat dibatalkan — semua data permohonan dan dokumen pengguna ini akan turut dipadam.
            </div>
            <div style={modalFooterStyle}>
              <button onClick={closeModal} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Batal</button>
              <button
                onClick={handleDeleteConfirm}
                disabled={saving}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer' }}
              >
                {saving ? 'Memadam...' : 'Padam Selamanya'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Reset password ── */}
      {modal === 'reset' && activeUser && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: 440 }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Tetapkan Semula Kata Laluan</h3>
              <button onClick={closeModal} style={iconBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
                Untuk <strong>{activeUser.full_name}</strong> ({activeUser.email})
              </p>

              {!tempPassword ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => handleResetPassword('set')}
                    disabled={saving}
                    style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>Jana kata laluan sementara</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Baca kata laluan kepada pengguna secara terus (telefon/kaunter)</div>
                  </button>
                  <button
                    onClick={() => handleResetPassword('link')}
                    disabled={saving}
                    style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>Hantar pautan tetapan semula</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Pengguna menetapkan kata laluan baharu sendiri melalui emel</div>
                  </button>
                </div>
              ) : (
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 6 }}>Kata laluan sementara baharu:</div>
                  <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: 'white', letterSpacing: 1 }}>{tempPassword}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>
                    Catatan ini tidak disimpan di sistem. Sila berikan kepada pengguna sekarang.
                  </div>
                </div>
              )}
            </div>
            <div style={modalFooterStyle}>
              <button onClick={closeModal} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                {tempPassword ? 'Tutup' : 'Batal'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Field({ label, value, onChange, type = 'text', disabled = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean;
}) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', background: disabled ? 'rgba(255,255,255,0.02)' : 'var(--navy-mid)',
          border: '1px solid var(--border)', borderRadius: 8, color: disabled ? 'var(--text-muted)' : 'white', outline: 'none',
        }}
      />
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20,
};
const modalStyle: React.CSSProperties = {
  background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: 16,
  width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto',
};
const modalHeaderStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px', borderBottom: '1px solid var(--border)',
};
const modalFooterStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', gap: 10,
  padding: '14px 20px', borderTop: '1px solid var(--border)',
};
const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
};