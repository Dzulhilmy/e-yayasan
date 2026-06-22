'use client';
import { useState, useEffect } from 'react';
import { Bookmark, ChevronRight, Calendar, Search, TrendingUp, BookOpen, Users, Leaf, Newspaper, GraduationCap, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const mockNewsItems = [
  {
    id: 1, date: '08 Mei 2026', category: 'Pendidikan', tag: 'badge-gold',
    title: 'Raih Keputusan Cemerlang, Pelajar AACS & BMB Dirai',
    excerpt: 'Seramai 36 anak-anak cemerlang di bawah Program Anak Angkat Cikgu Saarani (AACS) dan Biasiswa Menteri Besar Perak (BMB), antara inisiatif terbaru Yayasan Perak, telah dirai dalam majlis penghargaan khas.',
    icon: BookOpen, color: '#F5A623', saved: false,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 2, date: '27 Apr 2026', category: 'Komuniti', tag: 'badge-blue',
    title: 'Reruai Jelajah Desaku & Reruai OSC Sejahtera Sosial',
    excerpt: 'Yayasan Perak terus giat mendekati masyarakat dengan menyantuni para pelajar serta komuniti setempat melalui pembukaan reruai pameran sempena Jelajah Desaku dan OSC Sejahtera Sosial.',
    icon: Users, color: '#0EA5E9', saved: true,
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 3, date: '23 Apr 2026', category: 'Agro', tag: 'badge-green',
    title: 'Melakar Masa Depan Agro, Membangun Anak Perak',
    excerpt: 'Kerajaan Negeri Perak memperkenalkan Biasiswa Agrotek Perak SADC–Yayasan Perak sebagai laluan kepada anak negeri yang berdedikasi dalam bidang pertanian moden.',
    icon: Leaf, color: '#10B981', saved: false,
    image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 4, date: '22 Apr 2026', category: 'Biasiswa', tag: 'badge-gold',
    title: 'Biasiswa YAB Menteri Besar Perak SPM 2026 – Harapan Anak Perak, Sokongan Negeri',
    excerpt: 'Kerajaan Negeri Perak meneruskan pelaksanaan Program Biasiswa Menteri Besar Perak diterajui Yayasan Perak dengan kerjasama Jabatan Pendidikan Negeri Perak bagi pelajar SPM 2026.',
    icon: TrendingUp, color: '#8B5CF6', saved: false,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop'
  },
];

const categories = ['Semua', 'Pendidikan', 'Komuniti', 'Biasiswa', 'Agro', 'Usahawan'];

export default function FeedPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [saved, setSaved] = useState<Record<number, boolean>>({ 2: true });
  const [news, setNews] = useState<any[]>(mockNewsItems);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFeed() {
      const { data, error } = await supabase.from('feed_posts').select('*').order('date_published', { ascending: false });
      
      if (!error && data && data.length > 0) {
        const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
        const formatted = data.map((item: any) => {
          const d = new Date(item.date_published);
          const dateStr = `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
          return {
            id: item.id,
            date: dateStr,
            category: item.category,
            tag: item.tag || 'badge-blue',
            title: item.title,
            excerpt: item.excerpt,
            icon: item.icon_name === 'Users' ? Users : item.icon_name === 'Leaf' ? Leaf : item.icon_name === 'TrendingUp' ? TrendingUp : BookOpen,
            color: item.icon_color || '#F5A623',
            saved: false,
            image: item.image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop',
          };
        });
        setNews(formatted);
      }
    }
    fetchFeed();
  }, []);

  const toggleSave = (id: number) => setSaved(s => ({ ...s, [id]: !s[id] }));

  const filtered = news.filter(n => {
    const matchCat = activeCategory === 'Semua' || n.category === activeCategory;
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={16} /> Live Feed
          </div>
          <h1 className="heading-lg" style={{ marginTop: 12, marginBottom: 16 }}>
            Berita & Pengumuman <span className="gradient-text">Terkini</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 540 }}>Ikuti perkembangan terbaru Yayasan Perak. Simpan artikel untuk dibaca kemudian.</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder="Cari berita..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
          </div>
          <div className="tabs">
            {categories.map(cat => (
              <button key={cat} className={`tab-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        {/* News Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filtered.map((item, i) => (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
                {/* News Image */}
                <div style={{ width: '100%', height: 220, background: 'var(--navy-mid)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Subtle overlay gradient to blend with card */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,0.8) 0%, transparent 40%)', pointerEvents: 'none' }} />
                </div>

                {/* Content */}
                <div style={{ display: 'flex', gap: 20, padding: '24px' }}>
                  {/* Date Stamp */}
                  <div style={{ width: 56, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'var(--gold)', lineHeight: 1 }}>{item.date.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.date.split(' ')[1]}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.date.split(' ')[2]}</div>
                  </div>

                  <div style={{ width: 1, background: 'var(--border)', flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge ${item.tag}`}>{item.category}</span>
                      </div>
                      <button onClick={() => toggleSave(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: saved[item.id] ? 'var(--gold)' : 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                        <Bookmark size={16} fill={saved[item.id] ? 'currentColor' : 'none'} />
                        {saved[item.id] ? 'Tersimpan' : 'Simpan'}
                      </button>
                    </div>

                    <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.45, marginBottom: 10 }}>{item.title}</h2>
                    {/* Excerpt clamped to 2 lines for a splendid look */}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.excerpt}</p>

                    <button onClick={() => setSelectedArticle(item)} style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem', fontWeight: 600, color: item.color, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      Baca Penuh <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <Search size={40} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                <p>Tiada berita ditemui.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Saved Articles */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.96rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bookmark size={16} style={{ color: 'var(--gold)' }} /> Artikel Tersimpan
              </h3>
              {news.filter((n: any) => saved[n.id]).length === 0
                ? <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Tiada artikel tersimpan.</p>
                : news.filter((n: any) => saved[n.id]).map((n: any) => (
                  <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{n.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{n.date}</div>
                  </div>
                ))
              }
            </div>

            {/* Training Events */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.96rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} /> YP Training Academy
              </h3>
              {[
                { title: 'Seminar EDP 4: The Art Of Negotiation', date: '14-15 Jan 2026', venue: 'Casuarina Meru' },
                { title: 'Speak With Confidence', date: '16-17 Apr 2025', venue: 'Casuarina Meru' },
              ].map(ev => (
                <div key={ev.title} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, marginBottom: 4 }}>{ev.title}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <Calendar size={12} />
                    {ev.date} · {ev.venue}
                  </div>
                </div>
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

      {/* Article Modal */}
      {selectedArticle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', padding: '40px 20px', overflowY: 'auto' }}>
          {/* Backdrop */}
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 11, 20, 0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedArticle(null)} />
          
          {/* Modal Content */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 720, margin: 'auto', background: 'var(--navy-card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setSelectedArticle(null)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
              <X size={18} />
            </button>
            
            <div style={{ width: '100%', height: 280, flexShrink: 0, position: 'relative' }}>
              <img src={selectedArticle.image} alt={selectedArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--navy-card) 0%, transparent 50%)' }} />
            </div>

            <div style={{ padding: '0 32px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: -10, position: 'relative' }}>
                <span className={`badge ${selectedArticle.tag}`}>{selectedArticle.category}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedArticle.date}</span>
              </div>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 800, fontSize: '1.6rem', lineHeight: 1.3, marginBottom: 20 }}>{selectedArticle.title}</h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8 }}>
                {/* Normally we'd render full markdown or HTML here, but since we only have excerpt, we show it nicely */}
                <p style={{ marginBottom: 16 }}>{selectedArticle.excerpt}</p>
                <p>Portal e-YP akan sentiasa dikemaskini dengan kandungan berita penuh dari pangkalan data Yayasan Perak tidak lama lagi. Terus ikuti perkembangan kami!</p>
              </div>
              
              <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                <button onClick={() => { toggleSave(selectedArticle.id); setSelectedArticle(null); }} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Bookmark size={18} fill={saved[selectedArticle.id] ? 'currentColor' : 'none'} style={{ color: saved[selectedArticle.id] ? 'var(--gold)' : 'currentColor' }} />
                  {saved[selectedArticle.id] ? 'Artikel Tersimpan' : 'Simpan Artikel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
