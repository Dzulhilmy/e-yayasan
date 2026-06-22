'use client';
import Link from 'next/link';
import { MapPin, Phone, Mail, ExternalLink, Heart } from 'lucide-react';

const programLinks = [
  { label: 'Tabung Simpanan Pendidikan', href: '/programs' },
  { label: 'Insentif Siswa (INSISYP)', href: '/programs' },
  { label: 'Bantuan Sara Diri', href: '/apply' },
  { label: 'Sayangi Rumahku', href: '/programs' },
  { label: 'Pinjaman Tabung Usahawan', href: '/programs' },
];

const quickLinks = [
  { label: 'Soalan Lazim (FAQ)', href: '/assistant' },
  { label: 'Semak Status Permohonan', href: '/dashboard' },
  { label: 'Digital Vault', href: '/vault' },
  { label: 'Berita Terkini', href: '/feed' },
  { label: 'Hubungi Kami', href: '/contact' },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy-mid)', borderTop: '1px solid var(--border)', marginTop: 80 }}>
      <div className="container" style={{ paddingTop: 60, paddingBottom: 32 }}>
        {/* Top Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                padding: 6, flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                <img 
                  src="/yp-logo.png" 
                  alt="e-YP Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  onError={(e) => {
                    const wrapper = e.currentTarget.parentElement;
                    if (wrapper) {
                      wrapper.style.display = 'none';
                      if (wrapper.nextElementSibling) {
                        (wrapper.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }
                  }}
                />
              </div>
              <div style={{
                display: 'none', // Hidden by default, shown by fallback above
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #F5A623, #D4891A)',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#0A1628',
              }}>eYP</div>
              <div>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>e-YP</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>PORTAL YAYASAN PERAK</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 320, marginBottom: 20 }}>
              Platform digital Yayasan Perak — menghubungkan komuniti Perak dengan program bantuan pendidikan, sosial dan keusahawanan.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                <MapPin size={15} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
                Wisma Yayasan Perak, No. 111, Jalan Sultan Idris Shah, 30000 Ipoh, Perak
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                <Phone size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                05 – 255 2929
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                <Mail size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                info@yayasanperak.com.my
              </div>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Program Bantuan</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {programLinks.map(l => (
                <li key={l.label}>
                  <Link href={l.href} style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                    <span style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>●</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Pautan Pantas</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quickLinks.map(l => (
                <li key={l.label}>
                  <Link href={l.href} style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                    <span style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>●</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a href="https://yayasanperak.gov.my/v7/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, padding: '8px 14px', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 500 }}>
              <ExternalLink size={13} />
              Portal Rasmi YP
            </a>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            © 2026 Yayasan Perak. Hakcipta Terpelihara.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          footer > div > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
