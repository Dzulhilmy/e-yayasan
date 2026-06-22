'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Info, ChevronLeft, ChevronRight, Calendar, Tag, ExternalLink, Megaphone, Bell, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// ─── Mock Data ─────────────────────────────────────────────────────────────
const mockInfos = [
  {
    id: '1',
    title: 'Selamat Menyambut Hari Ibu 2026',
    category: 'Sambutan',
    date: '10 Mei 2026',
    description: 'Yayasan Perak mengucapkan Selamat Hari Ibu kepada semua ibu yang telah berkorban tanpa batasan demi masa depan anak-anak tercinta.',
    image_url: '',
    color: '#EC4899',
  },
  {
    id: '2',
    title: 'Notis: Permohonan Bantuan INSISYP 2026 Dibuka',
    category: 'Notis Rasmi',
    date: '01 Jun 2026',
    description: 'Permohonan bantuan insentif pelajar cemerlang (INSISYP) sesi 2026 kini dibuka. Semua pelajar yang memenuhi syarat adalah digalakkan untuk memohon.',
    image_url: '',
    color: '#F5A623',
  },
  {
    id: '3',
    title: 'Pengumuman: Cuti Perayaan Hari Wesak',
    category: 'Pengumuman',
    date: '12 Mei 2026',
    description: 'Yayasan Perak akan ditutup pada 12 Mei 2026 sempena Hari Wesak. Semua perkhidmatan akan disambung semula pada 13 Mei 2026.',
    image_url: '',
    color: '#0EA5E9',
  },
  {
    id: '4',
    title: 'Kempen Derma: Bantuan Awal Persekolahan 2026',
    category: 'Kempen',
    date: '15 Jun 2026',
    description: 'Sertai kempen derma kami untuk membantu anak-anak yatim piatu dan keluarga B40 mendapatkan peralatan sekolah yang lengkap.',
    image_url: '',
    color: '#10B981',
  },
  {
    id: '5',
    title: 'Info: Perkhidmatan e-YP Kini Lebih Pantas',
    category: 'Info Sistem',
    date: '20 Mei 2026',
    description: 'Platform e-YP telah dinaik taraf untuk memberikan pengalaman pengguna yang lebih lancar dan pantas. Terima kasih atas kesabaran anda.',
    image_url: '',
    color: '#8B5CF6',
  },
  {
    id: '6',
    title: 'Majlis Penyampaian Anugerah Cemerlang 2026',
    category: 'Acara',
    date: '28 Jun 2026',
    description: 'Majlis penyampaian anugerah tahunan akan diadakan di Dewan Seri Perak. Jemputan akan dihantar kepada semua penerima manfaat yang layak.',
    image_url: '',
    color: '#F97316',
  },
];

const categoryColors: Record<string, string> = {
  'Sambutan': '#EC4899',
  'Notis Rasmi': '#F5A623',
  'Pengumuman': '#0EA5E9',
  'Kempen': '#10B981',
  'Info Sistem': '#8B5CF6',
  'Acara': '#F97316',
};

// Featured carousel item
function FeaturedCarousel({ items }: { items: typeof mockInfos }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  const item = items[current];
  const color = categoryColors[item.category] || '#F5A623';

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      background: 'var(--navy-card)',
      minHeight: 340,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Background visual */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${color}18 0%, var(--navy-mid) 100%)`,
      }} />
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 250, height: 250, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '32px' }}>
        <span style={{
          display: 'inline-block', padding: '4px 12px', borderRadius: 100,
          background: `${color}25`, border: `1px solid ${color}50`,
          color: color, fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16,
        }}>
          {item.category}
        </span>
        <h2 style={{ fontSize: 'clamp(1.1rem,3vw,1.5rem)', fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>
          {item.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20 }}>
          {item.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <Calendar size={13} />
            {item.date}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)',
        display: 'flex', gap: 8, zIndex: 2,
      }}>
        <button
          onClick={() => setCurrent(prev => (prev - 1 + items.length) % items.length)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(15,30,56,0.8)', border: '1px solid var(--border)',
            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronLeft size={18} />
        </button>
      </div>
      <div style={{
        position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)',
        zIndex: 2,
      }}>
        <button
          onClick={() => setCurrent(prev => (prev + 1) % items.length)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(15,30,56,0.8)', border: '1px solid var(--border)',
            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dots */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, zIndex: 2,
      }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 20 : 6, height: 6,
              borderRadius: 100,
              background: i === current ? '#F5A623' : 'rgba(255,255,255,0.3)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function InfoPage() {
  const [infos, setInfos] = useState(mockInfos);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [animated, setAnimated] = useState(false);

  const supabase = createClient();

  const categories = ['Semua', ...Array.from(new Set(mockInfos.map(i => i.category)))];

  useEffect(() => {
    const fetchInfos = async () => {
      try {
        const { data, error } = await supabase
          .from('infos')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) setInfos(data);
      } catch (_) {
        // fallback to mock
      } finally {
        setLoading(false);
        setTimeout(() => setAnimated(true), 100);
      }
    };
    fetchInfos();
  }, []);

  const filtered = activeCategory === 'Semua'
    ? infos
    : infos.filter(i => i.category === activeCategory);

  const featured = infos.slice(0, 5);

  return (
    <>
      {/* Hero */}
      <section style={{
        padding: '80px 0 40px',
        background: 'linear-gradient(180deg, var(--navy) 0%, var(--navy-mid) 100%)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container">
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: 24 }}>
            <ArrowLeft size={15} /> Kembali ke Utama
          </Link>
          <div style={{
            opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease',
          }}>
            <div className="section-label" style={{ marginBottom: 16 }}>
              <Info size={15} /> Info Terkini
            </div>
            <h1 className="heading-lg" style={{ marginBottom: 12 }}>
              Maklumat &amp; <span className="gradient-text">Pengumuman</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 520, lineHeight: 1.7 }}>
              Ikuti perkembangan terkini, notis rasmi, kempen dan pengumuman daripada Yayasan Perak.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

            {/* LEFT: Main */}
            <div>
              {/* Featured Carousel */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <Megaphone size={18} style={{ color: 'var(--gold)' }} />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Info Pilihan</h2>
                </div>
                <FeaturedCarousel items={featured} />
              </div>

              {/* Category Filter */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '6px 16px', borderRadius: 100, border: '1px solid',
                      borderColor: activeCategory === cat ? 'var(--gold)' : 'var(--border)',
                      background: activeCategory === cat ? 'rgba(245,166,35,0.15)' : 'transparent',
                      color: activeCategory === cat ? 'var(--gold)' : 'var(--text-secondary)',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Info Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {filtered.map((info, i) => {
                  const color = categoryColors[info.category] || '#F5A623';
                  return (
                    <div
                      key={info.id}
                      className="card"
                      style={{
                        padding: 0, overflow: 'hidden', cursor: 'pointer',
                        opacity: animated ? 1 : 0,
                        transform: animated ? 'translateY(0)' : 'translateY(24px)',
                        transition: `all 0.5s ease ${i * 0.06}s`,
                      }}
                    >
                      {/* Image area */}
                      <div style={{
                        height: 140, position: 'relative',
                        background: `linear-gradient(135deg, ${color}20 0%, var(--navy-mid) 100%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {info.image_url ? (
                          <img src={info.image_url} alt={info.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              width: 56, height: 56, borderRadius: 16,
                              background: `${color}22`, border: `1px solid ${color}40`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              margin: '0 auto',
                            }}>
                              <Info size={26} style={{ color }} />
                            </div>
                          </div>
                        )}
                        <span style={{
                          position: 'absolute', top: 12, left: 12,
                          padding: '3px 10px', borderRadius: 100,
                          background: `${color}30`, border: `1px solid ${color}50`,
                          color, fontSize: '0.7rem', fontWeight: 700,
                          letterSpacing: '0.05em', textTransform: 'uppercase',
                          backdropFilter: 'blur(8px)',
                        }}>
                          {info.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 10 }}>
                          <Calendar size={12} /> {info.date}
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>
                          {info.title}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.6 }}>
                          {info.description.slice(0, 100)}...
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Latest Notices */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <Bell size={17} style={{ color: 'var(--gold)' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notis Terbaharu</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {infos.slice(0, 5).map((info, i) => {
                    const color = categoryColors[info.category] || '#F5A623';
                    return (
                      <div key={i} style={{
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        paddingBottom: 12,
                        borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: color, flexShrink: 0, marginTop: 5,
                        }} />
                        <div>
                          <p style={{ fontSize: '0.84rem', fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>
                            {info.title}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{info.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Categories Summary */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <Tag size={17} style={{ color: 'var(--gold)' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Kategori</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(categoryColors).map(([cat, color]) => {
                    const count = infos.filter(i => i.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 10,
                          background: activeCategory === cat ? `${color}15` : 'transparent',
                          border: `1px solid ${activeCategory === cat ? color + '40' : 'transparent'}`,
                          cursor: 'pointer', width: '100%', textAlign: 'left',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: activeCategory === cat ? color : 'var(--text-secondary)' }}>
                            {cat}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 700,
                          color, background: `${color}20`,
                          padding: '2px 8px', borderRadius: 100,
                        }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Link to Quotes */}
              <Link href="/quotes" className="card" style={{
                padding: '24px', textDecoration: 'none',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, var(--navy-card) 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '1.4rem' }}>💬</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>YP Quotes</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Kata-kata ilham dari Yayasan Perak</p>
                </div>
                <ExternalLink size={16} style={{ color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 900px) {
          .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
