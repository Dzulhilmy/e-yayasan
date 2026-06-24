'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Newspaper, Settings, LogOut, ShieldCheck, Info, Image, FileText } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === '/admin/login' || pathname === '/admin') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy)', color: '#fff' }}>
        {children}
      </div>
    );
  }

  const menu = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Permohonan', path: '/admin/applications', icon: FileText },
    { label: 'Program Bantuan', path: '/admin/programs', icon: BookOpen },
    { label: 'Berita Terkini', path: '/admin/feed', icon: Newspaper },
    { label: 'Info Terkini', path: '/admin/info', icon: Info },
    { label: 'Petikan YP', path: '/admin/quotes', icon: Image },
    { label: 'Segnmen Pengguna', path: '/admin/users', icon: Users },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy-bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 280, background: 'var(--navy)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={28} style={{ color: 'var(--gold)' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.5px' }}>YP Admin</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>System Management</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {menu.map((item) => {
            const isActive = pathname?.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive ? 'rgba(245, 166, 35, 0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s'
              }}>
                <item.icon size={18} style={{ color: isActive ? 'var(--gold)' : 'inherit' }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--border)' }}>
          <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: 'var(--red)', fontWeight: 500 }}>
            <LogOut size={18} /> Log Keluar
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{ height: 70, borderBottom: '1px solid var(--border)', background: 'var(--navy-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>
            {menu.find(m => pathname?.startsWith(m.path))?.label || 'Admin Portal'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              AD
            </div>
            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>Administrator</div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
