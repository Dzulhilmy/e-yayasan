'use client';
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, Send, CheckCircle, Navigation, Building2 } from 'lucide-react';

const offices = [
  {
    name: 'Ibu Pejabat – Ipoh',
    address: 'Wisma Yayasan Perak, No. 111, Jalan Sultan Idris Shah, 30000 Ipoh, Perak',
    phone: '05 – 255 2929',
    fax: '05 – 253 1701',
    email: 'info@yayasanperak.com.my',
    hours: 'Isnin – Jumaat: 8:00 pagi – 5:00 petang',
    main: true,
    map: 'https://maps.google.com/?q=Wisma+Yayasan+Perak+Ipoh',
  },
  {
    name: 'Cawangan Teluk Intan',
    address: 'No. 5, Jalan Tambang Bharu, 36000 Teluk Intan, Perak',
    phone: '05 – 622 XXXX',
    fax: '—',
    email: 'telukinta@yayasanperak.com.my',
    hours: 'Isnin – Jumaat: 8:00 pagi – 4:30 petang',
    main: false,
    map: 'https://maps.google.com/?q=Teluk+Intan+Perak',
  },
  {
    name: 'Cawangan Taiping',
    address: 'No. 12, Jalan Kota, 34000 Taiping, Perak',
    phone: '05 – 807 XXXX',
    fax: '—',
    email: 'taiping@yayasanperak.com.my',
    hours: 'Isnin – Jumaat: 8:00 pagi – 4:30 petang',
    main: false,
    map: 'https://maps.google.com/?q=Taiping+Perak',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <div className="section-label">📍 Hubungi Kami</div>
          <h1 className="heading-lg" style={{ marginTop: 12 }}>Sokongan <span className="gradient-text">Yayasan Perak</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '1rem', maxWidth: 520 }}>
            Kami sedia membantu anda. Hubungi kami melalui pelbagai saluran atau lawati pejabat kami.
          </p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Quick Contact Cards */}
        <div className="grid-3" style={{ marginBottom: 48 }}>
          {[
            { icon: Phone, color: 'var(--gold)', bg: 'rgba(245,166,35,0.12)', title: 'Telefon', value: '05 – 255 2929', sub: 'Isnin – Jumaat, 8am – 5pm' },
            { icon: Mail, color: 'var(--teal)', bg: 'rgba(14,165,233,0.12)', title: 'Emel', value: 'info@yayasanperak.com.my', sub: 'Balasan dalam 2 hari bekerja' },
            { icon: MapPin, color: 'var(--green)', bg: 'rgba(16,185,129,0.12)', title: 'Lokasi', value: 'Wisma Yayasan Perak', sub: 'Jalan Sultan Idris Shah, Ipoh' },
          ].map(c => (
            <div key={c.title} className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: c.bg, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <c.icon size={24} style={{ color: c.color }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', marginBottom: 6 }}>{c.title}</div>
              <div style={{ color: c.color, fontWeight: 600, fontSize: '0.92rem', marginBottom: 4 }}>{c.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* Contact Form */}
          <div className="card">
            <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: 6 }}>Hantar Mesej</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>Kami akan membalas dalam 2 hari bekerja.</p>

            {sent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, marginBottom: 20 }}>
                <CheckCircle size={16} style={{ color: 'var(--green)' }} />
                <span style={{ color: 'var(--green-light)', fontSize: '0.88rem', fontWeight: 500 }}>Mesej anda telah dihantar. Terima kasih!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="input-label">Nama Penuh</label>
                  <input className="input-field" placeholder="Nama anda" value={form.name} onChange={e => update('name', e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">Emel</label>
                  <input className="input-field" type="email" placeholder="emel@contoh.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="input-label">Subjek</label>
                <select className="input-field" value={form.subject} onChange={e => update('subject', e.target.value)} required>
                  <option value="">Pilih subjek...</option>
                  <option>Pertanyaan Program</option>
                  <option>Status Permohonan</option>
                  <option>Masalah Teknikal</option>
                  <option>Aduan</option>
                  <option>Lain-lain</option>
                </select>
              </div>
              <div>
                <label className="input-label">Mesej</label>
                <textarea className="input-field" rows={5} placeholder="Tuliskan mesej anda di sini..." value={form.message} onChange={e => update('message', e.target.value)} required style={{ resize: 'none' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <Send size={16} /> Hantar Mesej
              </button>
            </form>
          </div>

          {/* Offices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 700, fontSize: '1.2rem' }}>Lokasi Pejabat</h2>
            {offices.map(o => (
              <div key={o.name} className="card" style={{ borderColor: o.main ? 'rgba(245,166,35,0.3)' : 'var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Building2 size={18} style={{ color: o.main ? 'var(--gold)' : 'var(--text-muted)' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>{o.name}</div>
                  </div>
                  {o.main && <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>Ibu Pejabat</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                    <MapPin size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />{o.address}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                    <Phone size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />{o.phone}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                    <Clock size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />{o.hours}
                  </div>
                </div>
                <a href={o.map} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>
                  <Navigation size={13} /> Navigasi ke Sini
                </a>
              </div>
            ))}

            {/* External Links */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.96rem', marginBottom: 14 }}>🔗 Pautan Berguna</h3>
              {[
                { label: 'Sistem Aduan Awam (SPAB)', href: 'https://perak.spab.gov.my/' },
                { label: 'Portal Mohon Bantuan', href: 'https://bantuanyayasanperak.com/' },
                { label: 'Laman Web Rasmi YP', href: 'https://yayasanperak.gov.my/v7/' },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.86rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                  {l.label}
                  <ExternalLink size={13} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .container > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
