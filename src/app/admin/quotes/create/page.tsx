'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/ImageUpload';

export default function CreateQuote() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error('Sila muat naik sekeping imej.');
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('quotes')
        .insert([{ image_url: imageUrl }]);

      if (error) throw error;

      toast.success('Imej Quote berjaya diterbitkan!');
      router.push('/admin/quotes');
    } catch (err: any) {
      console.error(err);
      toast.error('Ralat menerbitkan quote: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
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
        
        <ImageUpload
          label="Muat Naik Imej Quote"
          hint="(Gambar nisbah 1:1 digalakkan)"
          value={imageUrl}
          bucket="profile-avatars"
          folder="quotes"
          onChange={(url) => setImageUrl(url)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ gap: 8, width: '100%', justifyContent: 'center' }}>
            <Save size={18} /> Simpan Imej
          </button>
        </div>
      </form>
    </div>
  );
}
