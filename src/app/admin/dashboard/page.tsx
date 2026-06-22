'use client';
import { Users, FileText, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const stats = [
  { label: 'Jumlah Pengguna', value: '12,450', change: '+12%', icon: Users, color: '#3B82F6' },
  { label: 'Permohonan Baru', value: '843', change: '+5%', icon: FileText, color: '#10B981' },
  { label: 'Dana Diagihkan', value: 'RM 1.2M', change: '+2%', icon: TrendingUp, color: '#F5A623' },
  { label: 'Menunggu Kelulusan', value: '156', change: '-10%', icon: Clock, color: '#8B5CF6' },
];

export default function AdminDashboard() {
  const handleViewAll = () => toast.info('Navigasi ke halaman pengurusan permohonan sedang dimuatkan...');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'var(--navy-card)', padding: '24px', borderRadius: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              <stat.icon size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: 8, fontWeight: 600 }}>{stat.change} bulan ini</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Recent Applications */}
        <div style={{ background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Permohonan Terkini</h2>
            <button onClick={handleViewAll} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.85rem', cursor: 'pointer' }}>Lihat Semua</button>
          </div>
          <div style={{ padding: 24 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i !== 5 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--navy-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Ahmad bin Abdullah</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Insentif Siswa (INSISYP)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2 jam lepas</span>
                  <span className="badge badge-blue">Menunggu</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
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
