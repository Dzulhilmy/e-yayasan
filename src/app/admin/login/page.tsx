'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    (async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) {
          setMessage('Gagal mendapatkan maklumat pengguna.');
          return;
        }

        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', userId)
          .single();

        if (pErr) {
          setMessage('Tidak dapat semak kelayakan pentadbir.');
          return;
        }

        if (!profile?.is_admin) {
          setMessage('Akaun ini bukan pentadbir.');
          return;
        }

        router.push('/admin/dashboard');
      } catch (err) {
        console.error(err);
        setMessage('Ralat semasa log masuk.');
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleForgot = async () => {
    const targetEmail = email || window.prompt('Masukkan alamat emel untuk set semula kata laluan:')
    if (!targetEmail) return
    setLoading(true)
    try {
      const supabase = createClient()
      // Supabase v2: resetPasswordForEmail
      const { data, error } = await supabase.auth.resetPasswordForEmail(targetEmail)
      if (error) {
        alert('Gagal menghantar pautan set semula: ' + error.message)
      } else {
        alert('Jika akaun wujud, pautan set semula kata laluan telah dihantar ke emel tersebut.')
      }
    } catch (err) {
      console.error(err)
      alert('Ralat menghantar pautan set semula.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: {} } });
      if (error) {
        setMessage(error.message);
        return;
      }

      const userId = (data as any)?.user?.id;
      if (userId) {
        // upsert profile (user will be authenticated client-side if signUp auto-signs in)
        const { error: pErr } = await supabase.from('profiles').upsert([{ user_id: userId, email, full_name: fullName }], { onConflict: 'user_id' });
        if (pErr) console.error('profile upsert error', pErr);
      }

      setMessage('Akaun dicipta. Sila semak emel untuk pengesahan jika diperlukan.');
      setMode('login');
    } catch (err) {
      console.error(err);
      setMessage('Ralat semasa mendaftar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy-bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '40px', background: 'var(--navy-card)', borderRadius: 24, border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ShieldCheck size={48} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Admin Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Log masuk untuk menguruskan sistem e-YP</p>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          <button onClick={() => setMode('login')} className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 12px' }}>Log Masuk</button>
          <button onClick={() => setMode('signup')} className={`btn ${mode === 'signup' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 12px' }}>Daftar</button>
        </div>

        {message && (
          <div style={{ marginBottom: 12, textAlign: 'center', color: 'var(--text-secondary)' }}>{message}</div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alamat Emel</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@yayasanperak.com.my"
              style={{ width: '100%', padding: '14px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kata Laluan</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '14px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nama Penuh</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nama Penuh"
                style={{ width: '100%', padding: '14px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '16px', marginTop: 8, justifyContent: 'center' }}>
            {loading ? 'Mengesahkan...' : (
              <>Log Masuk <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        {mode === 'login' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <button onClick={handleForgot} className="btn btn-ghost">Lupa Kata Laluan?</button>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Lock size={12} />
          Portal ini hanya untuk kegunaan pentadbir yang sah
        </div>
      </div>
    </div>
  );
}
