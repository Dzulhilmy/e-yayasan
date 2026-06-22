"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Eye, Download, CheckCircle, XCircle } from "lucide-react";

type AppRow = any;

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all'|'approved'|'rejected'|'pending'>('all');
  const [selected, setSelected] = useState<AppRow | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // ensure admin
      try {
        const r = await fetch('/api/auth/is-admin');
        const j = await r.json();
        if (!j.isAdmin) {
          // redirect to admin login
          router.push('/admin/login');
          return;
        }
      } catch (e) {
        console.error(e);
        router.push('/admin/login');
        return;
      }
      loadApps();
    })();
  }, []);

  async function loadApps() {
    setLoading(true);
    try {
      const res = await fetch('/api/applications/admin/list');
      if (!res.ok) return;
      const json = await res.json();
      setApps(json.data ?? []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  function filtered() {
    if (filter === 'all') return apps;
    if (filter === 'approved') return apps.filter(a => (a.status || '').toLowerCase().includes('lulus') || (a.status || '').toLowerCase().includes('approved') || (a.status || '').toLowerCase().includes('diluluskan'));
    if (filter === 'rejected') return apps.filter(a => (a.status || '').toLowerCase().includes('tolak') || (a.status || '').toLowerCase().includes('rejected'));
    return apps.filter(a => !['approved','diluluskan','rejected','ditolak'].some(s => (a.status||'').toLowerCase().includes(s)));
  }

  async function loadDocsFor(app: AppRow) {
    setDocs([]);
    if (!app?.user_id) return;
    try {
      const res = await fetch(`/api/applications/admin/documents?user_id=${app.user_id}`);
      if (!res.ok) return;
      const json = await res.json();
      setDocs(json.data ?? []);
    } catch (e) {
      console.error(e);
    }
  }

  async function openSigned(file_path: string) {
    try {
      const res = await fetch('/api/vault/admin/signed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file_path }) });
      if (!res.ok) return;
      const { url } = await res.json();
      if (url) window.open(url, '_blank');
    } catch (e) { console.error(e); }
  }

  async function updateStatus(appId: string, status: string) {
    try {
      const res = await fetch('/api/applications/admin/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: appId, status }) });
      if (!res.ok) {
        console.error('update failed', await res.text());
        return;
      }
      const json = await res.json();
      // update local
      setApps((prev) => prev.map(p => p.id === appId ? json.data ?? p : p));
      setSelected((s) => s && s.id === appId ? (json.data ?? s) : s);
    } catch (e) { console.error(e); }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className={`btn ${filter==='all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')}>Semua</button>
          <button className={`btn ${filter==='pending' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('pending')}>Menunggu</button>
          <button className={`btn ${filter==='approved' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('approved')}>Diluluskan</button>
          <button className={`btn ${filter==='rejected' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('rejected')}>Ditolak</button>
        </div>

        <div style={{ background: 'var(--navy-card)', padding: 12, borderRadius: 12, border: '1px solid var(--border)', maxHeight: '70vh', overflow: 'auto' }}>
          {loading && <div style={{ color: 'var(--text-muted)' }}>Memuatkan...</div>}
          {!loading && filtered().length === 0 && <div style={{ color: 'var(--text-muted)' }}>Tiada permohonan.</div>}
          {filtered().map((a) => (
            <div key={a.id} onClick={() => { setSelected(a); loadDocsFor(a); }} style={{ padding: 12, borderRadius: 10, marginBottom: 8, cursor: 'pointer', background: selected?.id === a.id ? 'rgba(245,166,35,0.06)' : 'transparent', border: `1px solid ${selected?.id === a.id ? 'rgba(245,166,35,0.12)' : 'transparent'}` }}>
              <div style={{ fontWeight: 700 }}>{a.ref ?? a.reference_number ?? '—'}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{a.program}</div>
              <div style={{ marginTop: 6 }}><span className={`badge ${a.status && (a.status.toLowerCase().includes('lulus') || a.status.toLowerCase().includes('approved')) ? 'badge-green' : a.status && (a.status.toLowerCase().includes('tolak') || a.status.toLowerCase().includes('rejected')) ? 'badge-red' : 'badge-blue'}`}>{a.status ?? 'Menunggu'}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div>
        {!selected && (
          <div className="card">Pilih permohonan untuk melihat butiran.</div>
        )}

        {selected && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>{selected.ref ?? selected.reference_number}</h2>
              <div>
                <button className="btn btn-ghost" onClick={() => updateStatus(selected.id, 'disemak')}><CheckCircle size={14} /> Semak</button>
                <button className="btn btn-danger" style={{ marginLeft: 8 }} onClick={() => updateStatus(selected.id, 'ditolak')}><XCircle size={14} /> Tolak</button>
                <button className="btn btn-success" style={{ marginLeft: 8 }} onClick={() => updateStatus(selected.id, 'diluluskan')}><CheckCircle size={14} /> Lulus</button>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              {/* status card */}
              <div style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border)', background: selected.status && (selected.status.toLowerCase().includes('lulus') || selected.status.toLowerCase().includes('approved')) ? 'rgba(16,185,129,0.06)' : selected.status && (selected.status.toLowerCase().includes('tolak') || selected.status.toLowerCase().includes('rejected')) ? 'rgba(255,59,48,0.06)' : 'var(--navy-mid)' }}>
                <div style={{ fontWeight: 700 }}>{selected.status ?? 'Menunggu'}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>{selected.created_at ? new Date(selected.created_at).toLocaleString() : ''}</div>
              </div>
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <h3>Butiran Pemohon</h3>
              <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{JSON.stringify(selected.data ?? selected, null, 2)}</pre>
              </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <h3>Dokumen Dilampirkan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {docs.length === 0 && <div style={{ color: 'var(--text-muted)' }}>Tiada dokumen ditemui untuk pemohon ini.</div>}
                {docs.map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{d.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{d.type} · {d.uploaded_at}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openSigned(d.file_url)}><Eye size={14} /> Lihat</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openSigned(d.file_url)}><Download size={14} /> Muat Turun</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
