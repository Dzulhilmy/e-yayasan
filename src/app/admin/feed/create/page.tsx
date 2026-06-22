'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateFeed() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
      loading: 'Menerbitkan berita...',
      success: () => {
        router.push('/admin/feed');
        return 'Berita berjaya diterbitkan!';
      },
      error: 'Ralat menerbitkan berita.',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.back()} style={{ background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Tambah Berita Baru</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Image Upload Area */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gambar Utama Berita</label>
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
                  <div style={{ fontSize: '0.8rem' }}>Format yang disokong: JPG, PNG, WEBP (Cadangan: 1200x630)</div>
                </>
              )}
            </div>
            <input type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tajuk Berita</label>
            <input required type="text" placeholder="Masukkan tajuk berita..." style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kategori</label>
            <select style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}>
              <option>Pendidikan</option>
              <option>Komuniti</option>
              <option>Agro</option>
              <option>Biasiswa</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tag Warna (Badge)</label>
            <select style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}>
              <option value="badge-blue">Biru (Umum)</option>
              <option value="badge-gold">Emas (Penting)</option>
              <option value="badge-green">Hijau (Berjaya)</option>
              <option value="badge-red">Merah (Amaran)</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kandungan Berita / Ringkasan</label>
            <textarea required rows={6} placeholder="Tulis isi kandungan berita di sini..." style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none', resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ gap: 8 }}>
            <Save size={18} /> Terbit Berita
          </button>
        </div>
      </form>
    </div>
  );
}
