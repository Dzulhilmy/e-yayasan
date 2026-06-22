'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFeed() {
  const router = useRouter();
  const [feed, setFeed] = useState<any[]>([
    { id: '1', title: 'Raih Keputusan Cemerlang, Pelajar AACS & BMB Dirai', category: 'Pendidikan', date_published: '2026-05-08T10:00:00Z', tag: 'badge-gold', image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=200&auto=format&fit=crop' },
    { id: '2', title: 'Reruai Jelajah Desaku & Reruai OSC Sejahtera Sosial', category: 'Komuniti', date_published: '2026-04-27T10:00:00Z', tag: 'badge-blue', image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=200&auto=format&fit=crop' },
    { id: '3', title: 'Melakar Masa Depan Agro, Membangun Anak Perak', category: 'Agro', date_published: '2026-04-23T10:00:00Z', tag: 'badge-green', image_url: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?q=80&w=200&auto=format&fit=crop' },
  ]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFeed() {
      const { data, error } = await supabase.from('feed_posts').select('*').order('date_published', { ascending: false });
      if (!error && data && data.length > 0) {
        setFeed(data);
      }
      setLoading(false);
    }
    fetchFeed();
  }, []);

  const handleAdd = () => router.push('/admin/feed/create');
  const handleEdit = (id: string) => router.push(`/admin/feed/edit/${id}`);
  const handleDelete = (title: string) => toast.error(`Berita "${title}" telah dipadam (Mock).`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 300 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Cari artikel/berita..." style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
        </div>
        <button onClick={handleAdd} className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={18} /> Tambah Berita
        </button>
      </div>

      <div style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--navy-mid)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tajuk Artikel</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kategori</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tarikh Terbit</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Memuatkan...</td></tr>
            ) : feed.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Tiada berita ditemui.</td></tr>
            ) : feed.map((f, i) => (
              <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Visualizer Image for Feed */}
                  <div style={{ width: 64, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--navy-mid)' }}>
                    <img 
                      src={f.image_url || `https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=200&auto=format&fit=crop`} 
                      alt="Thumbnail" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{f.title}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span className={`badge ${f.tag || 'badge-blue'}`}>{f.category}</span>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(f.date_published).toLocaleDateString('ms-MY')}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => handleEdit(f.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(f.title)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }}><Trash2 size={18} /></button>
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
