'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPrograms() {
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([
    { id: '1', title: 'Insentif Siswa Yayasan Perak (INSISYP)', subtitle: 'Bantuan IPT', category: 'Pendidikan', is_active: true },
    { id: '2', title: 'Sayangi Rumahku', subtitle: 'Bantuan Rumah B40', category: 'Modal Insan', is_active: true },
    { id: '3', title: 'Pinjaman Tabung Usahawan', subtitle: 'Modal PKS', category: 'Keusahawanan', is_active: true },
  ]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPrograms() {
      const { data, error } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setPrograms(data);
      }
      setLoading(false);
    }
    fetchPrograms();
  }, []);

  const handleAdd = () => router.push('/admin/programs/create');
  const handleEdit = (id: string) => router.push(`/admin/programs/edit/${id}`);
  const handleDelete = (title: string) => toast.error(`Program "${title}" telah dipadam (Mock).`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 300 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Cari program..." style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
        </div>
        <button onClick={handleAdd} className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={18} /> Tambah Program Baru
        </button>
      </div>

      <div style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--navy-mid)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Program</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kategori</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Memuatkan...</td></tr>
            ) : programs.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Tiada program ditemui.</td></tr>
            ) : programs.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Visualizer Image for Program */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'var(--navy-mid)' }}>
                    <img 
                      src={`https://images.unsplash.com/photo-${1520000000000 + i}?q=80&w=200&auto=format&fit=crop`} 
                      alt="Thumbnail" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.subtitle}</div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span className="badge badge-blue">{p.category}</span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {p.is_active 
                    ? <span style={{ color: 'var(--green)', fontSize: '0.85rem', fontWeight: 500 }}>Aktif</span>
                    : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Ditutup</span>
                  }
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => handleEdit(p.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(p.title)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }}><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
