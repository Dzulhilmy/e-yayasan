'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function EditInfo() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: 'Memuatkan...',
    category: 'Sambutan',
    color: '#EC4899',
    description: 'Memuatkan data...',
  });

  useEffect(() => {
    // Simulate fetching data from DB based on ID
    setTimeout(() => {
      setFormData({
        title: 'Selamat Menyambut Hari Ibu 2026',
        category: 'Sambutan',
        color: '#EC4899',
        description: 'Yayasan Perak mengucapkan Selamat Hari Ibu kepada semua ibu yang telah berkorban tanpa batasan demi masa depan anak-anak tercinta.',
      });
    }, 600);
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
      loading: 'Mengemas kini info...',
      success: () => {
        router.push('/admin/info');
        return 'Info berjaya dikemas kini!';
      },
      error: 'Ralat mengemas kini info.',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.back()} style={{ background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Sunting Info: {params.id}</h1>
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
                  <div style={{ width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--border)' }}>
                    <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop" alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                  </div>
                  <div style={{ fontWeight: 500, color: '#fff', marginBottom: 4 }}>Gambar Semasa</div>
                  <div style={{ fontSize: '0.8rem' }}>Klik untuk muat naik gambar baru</div>
                </>
              )}
            </div>
            <input type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tajuk Info</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kategori</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}>
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
              <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 12, cursor: 'pointer', background: 'transparent' }} />
              <input required type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ flex: 1, padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keterangan Lanjut</label>
            <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none', resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ gap: 8 }}>
            <Save size={18} /> Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
