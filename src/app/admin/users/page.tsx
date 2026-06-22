'use client';
import { useState } from 'react';
import { Search, UserCheck, UserX, MoreHorizontal, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';

const mockUsers = [
  { id: '1', name: 'Ahmad bin Abdullah', ic: '020512-08-5521', email: 'ahmad@example.com', status: 'verified', role: 'pemohon', joined: '12 Mei 2026' },
  { id: '2', name: 'Siti Nurhaliza binti Tarudin', ic: '030825-08-1234', email: 'siti@example.com', status: 'verified', role: 'pemohon', joined: '10 Mei 2026' },
  { id: '3', name: 'Muthu a/l Subramaniam', ic: '010101-08-9999', email: 'muthu@example.com', status: 'pending', role: 'pemohon', joined: '18 Mei 2026' },
  { id: '4', name: 'Lee Chong Wei', ic: '980101-08-8888', email: 'leecw@example.com', status: 'suspended', role: 'pemohon', joined: '01 Jan 2026' },
  { id: '5', name: 'Nor Aisyah', ic: '050214-08-7777', email: 'aisyah@example.com', status: 'verified', role: 'pemohon', joined: '15 Mei 2026' },
];

export default function AdminUsers() {
  const [search, setSearch] = useState('');

  const handleFilter = () => toast.info('Membuka panel tapisan (Filter).');
  const handleExport = () => {
    toast.success('Fail CSV berjaya dieksport.');
  };
  const handleAction = (name: string) => toast.info(`Tindakan pengguna dibuka untuk: ${name}`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Cari nama atau no. kad pengenalan..." style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleFilter} className="btn btn-secondary" style={{ gap: 8, padding: '10px 16px' }}>
            <Filter size={16} /> Tapis
          </button>
          <button onClick={handleExport} className="btn btn-secondary" style={{ gap: 8, padding: '10px 16px' }}>
            <Download size={16} /> Eksport CSV
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--navy-mid)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pemohon</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No. Kad Pengenalan</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tarikh Daftar</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', width: 80 }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {user.ic}
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {user.joined}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {user.status === 'verified' && <span className="badge badge-green">Disahkan</span>}
                  {user.status === 'pending' && <span className="badge badge-gold">Menunggu</span>}
                  {user.status === 'suspended' && <span className="badge badge-red">Digantung</span>}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button onClick={() => handleAction(user.name)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
