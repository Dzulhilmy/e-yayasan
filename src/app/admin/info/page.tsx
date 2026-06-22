'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInfo() {
  const router = useRouter();
  const [infos, setInfos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fix 1: memoize so client isn't recreated on every render
  const supabase = useMemo(() => createClient(), []);

  // Fix 2: supabase added to dependency array
  useEffect(() => {
    async function fetchInfos() {
      const { data, error } = await supabase
        .from('infos')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        toast.error('Gagal mengambil data dari database.');
      } else {
        setInfos(data || []);
      }
      setLoading(false);
    }
    fetchInfos();
  }, [supabase]);

  const handleAdd = () => router.push('/admin/info/create');
  const handleEdit = (id: string) => router.push(`/admin/info/edit/${id}`);

  // Fix 3: was called as handleDelete(info.title) — missing id, wrong arg order
  // Fix 4: functional setState to avoid stale closure
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Padam info "${title}"?`)) return;
    const { error } = await supabase.from('infos').delete().eq('id', id);
    if (error) {
      toast.error('Gagal memadam info.');
    } else {
      toast.success('Info berjaya dipadam.');
      setInfos((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 300 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cari info..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              background: 'var(--navy-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              color: '#fff',
              outline: 'none',
            }}
          />
        </div>
        <button onClick={handleAdd} className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={18} /> Tambah Info
        </button>
      </div>

      <div
        style={{
          background: 'var(--navy-card)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--navy-mid)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tajuk Info</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kategori</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tarikh</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Memuatkan...
                </td>
              </tr>
            ) : infos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tiada info ditemui.
                </td>
              </tr>
            ) : (
              infos.map((info) => (
                <tr key={info.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div
                        style={{
                          width: 64,
                          height: 48,
                          borderRadius: 8,
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: `${info.color || '#fff'}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {info.image_url ? (
                          <img
                            src={info.image_url}
                            alt="Thumbnail"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{ width: 12, height: 12, borderRadius: '50%', background: info.color || '#fff' }}
                          />
                        )}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{info.title}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: info.color,
                        background: `${info.color}15`,
                        padding: '4px 10px',
                        borderRadius: 100,
                        border: `1px solid ${info.color}30`,
                      }}
                    >
                      {info.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(info.date).toLocaleDateString('ms-MY')}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => handleEdit(info.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                      >
                        <Edit2 size={18} />
                      </button>
                      {/* Fix: was handleDelete(info.title) — now correctly passes both id and title */}
                      <button
                        onClick={() => handleDelete(info.id, info.title)}
                        style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}