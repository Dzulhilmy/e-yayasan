'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, GraduationCap, Home, Briefcase, Users, CheckCircle, Star, TrendingUp, BookOpen, Zap, FolderLock, Bot, Bell, ShieldCheck, MapPin, ChevronRight, Sparkles, Rocket, Newspaper, Target, Info, Quote, ChevronLeft, Heart } from 'lucide-react';

const stats = [
  { value: '150,000+', label: 'Penerima Manfaat', icon: Users },
  { value: 'RM 2.4B', label: 'Bantuan Diagihkan', icon: TrendingUp },
  { value: '12', label: 'Program Aktif', icon: CheckCircle },
  { value: '98%', label: 'Kepuasan Penerima', icon: Star },
];

// Placeholder for the Main Picture (Hero Section) - You can set this from the DB later
const mainPictureUrl = '';

const programs = [
  {
    icon: GraduationCap, color: '#F5A623', bg: 'rgba(245,166,35,0.12)',
    category: 'Pendidikan', title: 'Insentif Siswa (INSISYP)',
    desc: 'Insentif kewangan untuk pelajar cemerlang ke universiti dalam dan luar negara.',
    tag: 'Aktif', href: '/login', imageUrl: ''
  },
  {
    icon: BookOpen, color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)',
    category: 'Pendidikan', title: 'TASPENDIK – Tabung Pendidikan Anak Perak',
    desc: 'Skim simpanan pendidikan khas untuk anak-anak Perak bermula dari lahir.',
    tag: 'Aktif', href: '/login', imageUrl: ''
  },
  {
    icon: Home, color: '#10B981', bg: 'rgba(16,185,129,0.12)',
    category: 'Sosial', title: 'Sayangi Rumahku',
    desc: 'Bantuan pembaikan dan pengubahsuaian rumah untuk golongan B40 Perak.',
    tag: 'Aktif', href: '/login', imageUrl: ''
  },
  {
    icon: Briefcase, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',
    category: 'Usahawan', title: 'Pinjaman Tabung Usahawan',
    desc: 'Modal permulaan dan pinjaman untuk usahawan muda bumiputera Perak.',
    tag: 'Aktif', href: '/login', imageUrl: ''
  },
];

const exclusiveFeatures = [
  { icon: TrendingUp, color: '#F5A623', title: 'MyStatus Dashboard', desc: 'Pantau semua permohonan dalam satu papan pemuka bersepadu.', href: '/dashboard' },
  { icon: FolderLock, color: '#0EA5E9', title: 'Digital Vault', desc: 'Simpan dokumen penting sekali, guna berulang kali.', href: '/vault' },
  { icon: Bell, color: '#10B981', title: 'Notifikasi Real-Time', desc: 'Terima kemas kini status permohonan serta-merta.', href: '/dashboard' },
  { icon: ShieldCheck, color: '#8B5CF6', title: 'Login Biometrik', desc: 'Keselamatan tinggi dengan FaceID & PIN 6-digit.', href: '/dashboard' },
  { icon: MapPin, color: '#F97316', title: 'Perak Prihatin', desc: 'Notifikasi apabila berhampiran Reruai Pameran Yayasan Perak.', href: '/contact' },
  { icon: Bot, color: '#EC4899', title: 'AI Assistant', desc: 'Jawapan segera 24/7 dari Pembantu AI terlatih.', href: '/assistant' },
];

const latestNews = [
  { date: '08 Mei 2026', title: 'Raih Keputusan Cemerlang, Pelajar AACS & BMB Dirai', category: 'Pendidikan', imageUrl: '' },
  { date: '27 Apr 2026', title: 'Reruai Jelajah Desaku & Reruai OSC Sejahtera Sosial', category: 'Komuniti', imageUrl: '' },
  { date: '23 Apr 2026', title: 'Melakar Masa Depan Agro, Membangun Anak Perak', category: 'Agro', imageUrl: '' },
];

const infoItems = [
  { id: '1', title: 'Selamat Menyambut Hari Ibu 2026', category: 'Sambutan', date: '10 Mei 2026', color: '#EC4899', image_url: '' },
  { id: '2', title: 'Notis: Permohonan INSISYP 2026 Dibuka', category: 'Notis Rasmi', date: '01 Jun 2026', color: '#F5A623', image_url: '' },
  { id: '3', title: 'Pengumuman: Cuti Perayaan Hari Wesak', category: 'Pengumuman', date: '12 Mei 2026', color: '#0EA5E9', image_url: '' },
  { id: '4', title: 'Kempen Derma: Bantuan Awal Persekolahan', category: 'Kempen', date: '15 Jun 2026', color: '#10B981', image_url: '' },
  { id: '5', title: 'Info: Perkhidmatan e-YP Kini Lebih Pantas', category: 'Info Sistem', date: '20 Mei 2026', color: '#8B5CF6', image_url: '' },
];

const homeQuotes = [
  { id: '1', text: 'Toughest moments are the ones that build the strongest character. Keep going, your breakthrough is near.', author: 'Yayasan Perak', color: '#F5A623' },
  { id: '2', text: 'Ilmu adalah cahaya yang menerangi jalan hidup. Jadikan pendidikan sebagai senjata paling ampuh untuk mengubah nasib.', author: 'Yayasan Perak', color: '#0EA5E9' },
  { id: '3', text: 'Setiap anak Perak adalah amanah yang perlu dijaga. Bersama, kita bina masa depan yang lebih gemilang.', author: 'Yayasan Perak', color: '#10B981' },
  { id: '4', text: '"Sesungguhnya Allah tidak mengubah keadaan sesuatu kaum kecuali mereka mengubah keadaan yang ada pada diri mereka." — Ar-Ra\'d: 11', author: 'Al-Quran', color: '#8B5CF6' },
];

// ─── Info Carousel Component (homepage version) ───────────────────────────
function HomeInfoCarousel() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % infoItems.length), 3500);
    return () => clearInterval(t);
  }, []);
  const item = infoItems[current];
  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: `1px solid ${item.color}30`, background: 'var(--navy-card)', minHeight: 200 }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${item.color}15 0%, var(--navy-mid) 100%)` }} />
      {item.image_url && (
        <img src={item.image_url} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, padding: '28px', background: item.image_url ? 'linear-gradient(to top, rgba(15,30,56,0.95) 0%, rgba(15,30,56,0.4) 50%, transparent 100%)' : 'transparent', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, background: `${item.color}22`, border: `1px solid ${item.color}40`, color: item.image_url ? '#fff' : item.color, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 14, alignSelf: 'flex-start', backdropFilter: 'blur(4px)' }}>{item.category}</span>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 8, color: '#fff' }}>{item.title}</h3>
        <p style={{ fontSize: '0.78rem', color: item.image_url ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{item.date}</p>
      </div>
      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
        {infoItems.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 18 : 6, height: 6, borderRadius: 100, background: i === current ? item.color : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
        ))}
      </div>
      {/* Arrows */}
      <button onClick={() => setCurrent(p => (p - 1 + infoItems.length) % infoItems.length)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: 'rgba(15,30,56,0.8)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><ChevronLeft size={15} /></button>
      <button onClick={() => setCurrent(p => (p + 1) % infoItems.length)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: 'rgba(15,30,56,0.8)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><ChevronRight size={15} /></button>
    </div>
  );
}

export default function HomePage() {
  const [animated, setAnimated] = useState(false);
  const [activeQuote, setActiveQuote] = useState(0);
  const [likedQuotes, setLikedQuotes] = useState<Set<string>>(new Set());
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);
  useEffect(() => {
    const t = setInterval(() => setActiveQuote(p => (p + 1) % homeQuotes.length), 5000);
    return () => clearInterval(t);
  }, []);
  const toggleLike = (id: string) => setLikedQuotes(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <>
      {/* ─── HERO ─── */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '80px 0' }}>
        {/* Background Image (Placeholder) - Replace /hero-bg.png in the public folder to update this later */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("/hero-bg.png")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.18, pointerEvents: 'none', mixBlendMode: 'luminosity'
        }} />

        {/* Gradient Overlay for Readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,22,40,0.3) 0%, var(--navy) 100%)',
          pointerEvents: 'none'
        }} />

        {/* BG Glows */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Animated grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
              <div className="section-label" style={{ margin: '0 auto 28px' }}>
                ✦ Portal Digital Rasmi Yayasan Perak
              </div>
            </div>

            <div style={{ opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease 0.1s' }}>
              <h1 className="heading-xl" style={{ marginBottom: 24 }}>
                <span className="gradient-text">Iltizam Pendidikan,</span>
                <br />Transformasi Insan
              </h1>
            </div>

            <div style={{ opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease 0.2s' }}>
              <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 40, maxWidth: 640, margin: '0 auto 40px' }}>
                Platform digital bersepadu e-YP — mohon bantuan, semak status permohonan, simpan dokumen dan terima notifikasi dalam satu aplikasi.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 0.3s' }}>
              <Link href="/login" className="btn btn-primary btn-lg">
                <Zap size={18} />
                Mohon Bantuan Sekarang
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                Semak Status Saya
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap', opacity: animated ? 1 : 0, transition: 'all 0.7s ease 0.4s' }}>
              {['Selamat & Terenkripsi', 'Data Disimpan Tempatan', 'Disahkan Kerajaan'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <CheckCircle size={14} style={{ color: 'var(--green)' }} />
                  {b}
                </div>
              ))}
            </div>

            {/* Main Picture (Hero Image) dynamically loaded */}
            {mainPictureUrl && (
              <div style={{ marginTop: 60, opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s ease 0.5s' }}>
                <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', aspectRatio: '21/9', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                  <img src={mainPictureUrl} alt="Yayasan Perak" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--navy-mid)' }}>
        <div className="container">
          <div className="grid-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} style={{ color: 'var(--gold)' }} />
                  </div>
                </div>
                <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--gold)', letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROGRAMS ─── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label" style={{ margin: '0 auto 16px' }}>
              <BookOpen size={16} /> Katalog Program
            </div>
            <h2 className="heading-lg">Program Bantuan <span className="gradient-text">Yayasan Perak</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, maxWidth: 540, margin: '12px auto 0' }}>Semak kelayakan dan mohon bantuan dalam beberapa langkah mudah.</p>
          </div>
          <div className="grid-4">
            {programs.map(p => (
              <div key={p.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: p.imageUrl ? '0 0 24px 0' : '24px', overflow: 'hidden' }}>
                {p.imageUrl && (
                  <div style={{ width: '100%', height: 160, position: 'relative' }}>
                    <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="badge badge-green" style={{ position: 'absolute', top: 16, right: 16, backdropFilter: 'blur(8px)', background: 'rgba(16, 185, 129, 0.8)' }}>{p.tag}</span>
                  </div>
                )}
                
                <div style={{ padding: p.imageUrl ? '0 24px' : 0, display: 'flex', flexDirection: 'column', flex: 1, gap: 16 }}>
                  {!p.imageUrl && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: p.bg, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p.icon size={22} style={{ color: p.color }} />
                      </div>
                      <span className="badge badge-green">{p.tag}</span>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: p.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{p.category}</div>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{p.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6 }}>{p.desc}</p>
                  </div>
                  <Link href={p.href} style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem', fontWeight: 600, color: p.color }}>
                    Semak Kelayakan <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/programs" className="btn btn-secondary">
              Lihat Semua Program <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── APP-EXCLUSIVE FEATURES ─── */}
      <section className="section" style={{ background: 'var(--navy-mid)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label" style={{ margin: '0 auto 16px' }}>
              <Rocket size={16} /> Ciri Eksklusif
            </div>
            <h2 className="heading-lg">Lebih Dari Sekadar <span className="gradient-text">Laman Web</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, maxWidth: 540, margin: '12px auto 0' }}>Ciri-ciri digital yang direka khusus untuk memudahkan urusan anda.</p>
          </div>
          <div className="grid-3">
            {exclusiveFeatures.map(f => (
              <Link key={f.title} href={f.href} className="card" style={{ display: 'flex', gap: 18, alignItems: 'flex-start', textDecoration: 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LATEST NEWS ─── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 12 }}>
                <Newspaper size={16} /> Berita Terkini
              </div>
              <h2 className="heading-md">Kemas Kini <span className="gradient-text">Terbaru</span></h2>
            </div>
            <Link href="/feed" className="btn btn-ghost btn-sm">Lihat Semua <ArrowRight size={14} /></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {latestNews.map((n, i) => (
              <Link key={i} href="/feed" className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, textDecoration: 'none', padding: n.imageUrl ? '12px 24px 12px 12px' : '24px' }}>
                {n.imageUrl && (
                  <div style={{ width: 100, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={n.imageUrl} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                {!n.imageUrl && (
                  <div style={{ width: 64, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{n.date.split(' ')[1]} {n.date.split(' ')[2]}</div>
                    <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 800, fontSize: '1.6rem', color: 'var(--gold)', lineHeight: 1 }}>{n.date.split(' ')[0]}</div>
                  </div>
                )}
                {!n.imageUrl && <div style={{ width: 1, height: 48, background: 'var(--border)' }} />}
                <div style={{ flex: 1, paddingLeft: n.imageUrl ? 8 : 0 }}>
                  <span className="badge badge-blue" style={{ marginBottom: 8 }}>{n.category}</span>
                  <h3 style={{ fontWeight: 600, fontSize: '0.96rem', lineHeight: 1.5 }}>{n.title}</h3>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INFO TERKINI ─── */}
      <section className="section" style={{ background: 'var(--navy-mid)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 12 }}>
                <Info size={16} /> Info Terkini
              </div>
              <h2 className="heading-md">Maklumat &amp; <span className="gradient-text">Pengumuman</span></h2>
            </div>
            <Link href="/info" className="btn btn-ghost btn-sm">Lihat Semua <ArrowRight size={14} /></Link>
          </div>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <HomeInfoCarousel />
          </div>
        </div>
      </section>

      {/* ─── YP QUOTES ─── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 12 }}>
                <Sparkles size={16} /> YP Quotes
              </div>
              <h2 className="heading-md">Kata-kata <span className="gradient-text">Ilham</span></h2>
            </div>
            <Link href="/quotes" className="btn btn-ghost btn-sm">Lihat Semua <ArrowRight size={14} /></Link>
          </div>
          {/* Featured quote big card */}
          <div style={{ marginBottom: 28, padding: '36px', background: `linear-gradient(135deg, ${homeQuotes[activeQuote].color}12 0%, var(--navy-card) 100%)`, border: `1px solid ${homeQuotes[activeQuote].color}25`, borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', transition: 'all 0.5s ease' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${homeQuotes[activeQuote].color}15 0%, transparent 70%)` }} />
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${homeQuotes[activeQuote].color}20`, border: `1px solid ${homeQuotes[activeQuote].color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Quote size={22} style={{ color: homeQuotes[activeQuote].color }} />
            </div>
            <p style={{ fontSize: 'clamp(1rem,2.2vw,1.2rem)', fontStyle: 'italic', lineHeight: 1.8, fontWeight: 500, marginBottom: 16, color: 'var(--text-primary)', position: 'relative', zIndex: 1 }}>
              "{homeQuotes[activeQuote].text}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>— {homeQuotes[activeQuote].author}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {homeQuotes.map((_, i) => (
                  <button key={i} onClick={() => setActiveQuote(i)} style={{ width: i === activeQuote ? 20 : 7, height: 7, borderRadius: 100, background: i === activeQuote ? homeQuotes[activeQuote].color : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="section-sm">
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, var(--navy-light) 0%, var(--navy-card) 100%)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: 'clamp(32px,6vw,64px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div className="section-label" style={{ margin: '0 auto 20px' }}>
              <Target size={16} /> Mulakan Sekarang
            </div>
            <h2 className="heading-lg" style={{ marginBottom: 16 }}>Sedia Untuk <span className="gradient-text">Mohon Bantuan?</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>Proses permohonan mudah, selamat dan boleh dipantau dari mana sahaja.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" className="btn btn-primary btn-lg"><Zap size={18} />Mohon Bantuan</Link>
              <Link href="/assistant" className="btn btn-ghost btn-lg"><Bot size={18} />Tanya AI Assistant</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
