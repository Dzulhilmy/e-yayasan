'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

export default function CreateInfo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sambutan');
  const [color, setColor] = useState('#F5A623');
  const [description, setDescription] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('infos').insert([{
        title,
        category,
        color,
        description,
      }]);

      if (error) throw error;

      toast.success('Info berjaya diterbitkan!');
      router.push('/admin/info');
    } catch (err: any) {
      console.error(err);
      toast.error('Ralat menerbitkan info: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.back()} style={{ background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Tambah Info Baru</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Image Upload Area */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gambar (Pilihan)</label>
          <label style={{ display: 'block', cursor: 'pointer' }}>
            <div style={{ border: `2px dashed ${image ? 'var(--green)' : 'var(--border)'}`, borderRadius: 16, padding: image ? 16 : 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: image ? 'rgba(16, 185, 129, 0.05)' : 'var(--navy-bg)', transition: 'all 0.2s', overflow: 'hidden' }}>
              {image ? (
                <>
                  <div style={{ width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                    <img src={URL.createObjectURL(image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>{image.name}</div>
                  <div style={{ fontSize: '0.85rem' }}>Klik untuk tukar gambar</div>
                </>
              ) : (
                <>
                  <ImageIcon size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <div style={{ fontWeight: 500, color: '#fff', marginBottom: 4 }}>Klik untuk muat naik gambar</div>
                  <div style={{ fontSize: '0.8rem' }}>Format yang disokong: JPG, PNG, WEBP (Nisbah 1:1 digalakkan)</div>
                </>
              )}
            </div>
            <input type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tajuk Info</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masukkan tajuk info..." style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}>
              <option>Sambutan</option>
              <option>Notis Rasmi</option>
              <option>Pengumuman</option>
              <option>Kempen</option>
              <option>Info Sistem</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Warna Tema (Hex Code)</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 12, cursor: 'pointer', background: 'transparent' }} />
              <input required type="text" value={color} onChange={e => setColor(e.target.value)} style={{ flex: 1, padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keterangan Lanjut</label>
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tulis keterangan..." style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none', resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ gap: 8 }}>
            <Save size={18} /> Terbit Info
          </button>
        </div>
      </form>
    </div>
  );
}
