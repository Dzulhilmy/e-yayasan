'use client';
import { useEffect, useState } from 'react';
import { Users, FileText, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type DashboardStats = {
  totalUsers: number;
  newApplications: number;
  totalDisbursed: number;
  pendingCount: number;
};

type RecentApplication = {
  id: string;
  applicantName: string;
  program: string;
  status: string;
  createdAt: string;
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  diluluskan: { label: 'Diluluskan', className: 'badge-green' },
  approved:   { label: 'Diluluskan', className: 'badge-green' },
  ditolak:    { label: 'Ditolak',    className: 'badge-red' },
  rejected:   { label: 'Ditolak',    className: 'badge-red' },
  processing: { label: 'Diproses',   className: 'badge-blue' },
  submitted:  { label: 'Menunggu',   className: 'badge-blue' },
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Sebentar tadi';
  if (mins < 60) return `${mins} minit lepas`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lepas`;
  const days = Math.floor(hours / 24);
  return `${days} hari lepas`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Gagal memuatkan papan pemuka.');
      }
      const json = await res.json();
      setStats(json.stats);
      setRecent(json.recentApplications);
    } catch (e: any) {
      toast.error(e.message ?? 'Gagal memuatkan papan pemuka.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // Realtime: refresh stats + recent list whenever any application
  // changes anywhere in the system (new submission, status update, etc).
  // Admin needs visibility across ALL users, unlike the user-side
  // dashboard which filters to a single user_id.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-applications-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => {
          // Re-fetch rather than patch in place — aggregate counts
          // (totalDisbursed, pendingCount) need a real recompute, not
          // just a local list patch.
          loadDashboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleViewAll = () => router.push('/admin/permohonan');

  const statCards = [
    { label: 'Jumlah Pengguna', value: stats?.totalUsers.toLocaleString('ms-MY') ?? '—', icon: Users, color: '#3B82F6' },
    { label: 'Permohonan Baru (30 hari)', value: stats?.newApplications.toLocaleString('ms-MY') ?? '—', icon: FileText, color: '#10B981' },
    { label: 'Dana Diagihkan', value: stats ? `RM ${stats.totalDisbursed.toLocaleString('ms-MY')}` : '—', icon: TrendingUp, color: '#F5A623' },
    { label: 'Menunggu Kelulusan', value: stats?.pendingCount.toLocaleString('ms-MY') ?? '—', icon: Clock, color: '#8B5CF6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ background: 'var(--navy-card)', padding: '24px', borderRadius: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              <stat.icon size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {loading ? '—' : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Recent Applications — now live, from /api/admin/dashboard */}
        <div style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Permohonan Terkini</h2>
            <button onClick={handleViewAll} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.85rem', cursor: 'pointer' }}>
              Lihat Semua
            </button>
          </div>
          <div style={{ padding: 24 }}>
            {loading && (
              <div style={{ color: 'var(--text-muted)', padding: '16px 0' }}>Memuatkan...</div>
            )}
            {!loading && recent.length === 0 && (
              <div style={{ color: 'var(--text-muted)', padding: '16px 0' }}>Tiada permohonan terkini.</div>
            )}
            {!loading && recent.map((app, i) => {
              const badge = STATUS_BADGE[(app.status || '').toLowerCase()] ?? { label: app.status, className: 'badge-blue' };
              return (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i !== recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--navy-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{app.applicantName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.program}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{timeAgo(app.createdAt)}</span>
                    <span className={`badge ${badge.className}`}>{badge.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Status — left as static infrastructure info, since
            these reflect service configuration rather than application
            data (no realistic live signal to wire here without an
            actual healthcheck/monitoring endpoint). */}
        <div style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Status Sistem</h2>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={20} style={{ color: 'var(--green)' }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Pangkalan Data (Supabase)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Disegerakkan sepenuhnya</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={20} style={{ color: 'var(--green)' }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Sistem E-mel</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Beroperasi</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertCircle size={20} style={{ color: 'var(--gold)' }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Kemas Kini Portal</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Penjadualan seterusnya: 12:00 AM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}