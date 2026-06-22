'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateQuote() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.error('Sila muat naik sekeping imej.');
      return;
    }
    setLoading(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
      loading: 'Menerbitkan quote...',
      success: () => {
        router.push('/admin/quotes');
        return 'Imej Quote berjaya diterbitkan!';
      },
      error: 'Ralat menerbitkan quote.',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.back()} style={{ background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Tambah Imej Quote</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Image Upload Area */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Muat Naik Imej</label>
          <label style={{ display: 'block', cursor: 'pointer' }}>
            <div style={{ border: `2px dashed ${image ? 'var(--green)' : 'var(--border)'}`, borderRadius: 16, padding: image ? 16 : 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: image ? 'rgba(16, 185, 129, 0.05)' : 'var(--navy-bg)', transition: 'all 0.2s', overflow: 'hidden' }}>
              {image ? (
                <>
                  <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                    <img src={URL.createObjectURL(image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>{image.name}</div>
                  <div style={{ fontSize: '0.85rem' }}>Klik untuk tukar gambar</div>
                </>
              ) : (
                <>
                  <ImageIcon size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                  <div style={{ fontWeight: 500, color: '#fff', marginBottom: 6 }}>Pilih atau Seret (Drag) Imej Ke Sini</div>
                  <div style={{ fontSize: '0.8rem', textAlign: 'center' }}>Hanya format imej dibenarkan (JPG, PNG).<br/>Sila gunakan imej bernisbah 1:1 atau 4:5.</div>
                </>
              )}
            </div>
            <input type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ gap: 8, width: '100%', justifyContent: 'center' }}>
            <Save size={18} /> Simpan Imej
          </button>
        </div>
      </form>
    </div>
  );
}
