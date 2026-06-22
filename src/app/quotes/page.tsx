'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quote, Heart, Share2, ArrowLeft, Sparkles, BookOpen, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const mockQuotes = [
  {
    id: '1',
    text: 'Toughest moments are the ones that build the strongest character. Keep going, your breakthrough is near.',
    author: 'Yayasan Perak',
    category: 'Motivasi',
    color: '#F5A623',
    liked: false,
    bg: 'linear-gradient(135deg, rgba(245,166,35,0.15) 0%, rgba(15,30,56,0.95) 100%)',
  },
  {
    id: '2',
    text: 'Ilmu adalah cahaya yang menerangi jalan hidup. Jadikan pendidikan sebagai senjata paling ampuh untuk mengubah nasib.',
    author: 'Yayasan Perak',
    category: 'Pendidikan',
    color: '#0EA5E9',
    liked: false,
    bg: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(15,30,56,0.95) 100%)',
  },
  {
    id: '3',
    text: 'Setiap anak Perak adalah amanah yang perlu dijaga dan dipelihara. Bersama, kita bina masa depan yang lebih gemilang.',
    author: 'Yayasan Perak',
    category: 'Komuniti',
    color: '#10B981',
    liked: false,
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(15,30,56,0.95) 100%)',
  },
  {
    id: '4',
    text: 'Kejayaan bukan diukur dari pangkat atau harta, tetapi dari berapa ramai orang yang kita bantu di sepanjang perjalanan hidup.',
    author: 'Yayasan Perak',
    category: 'Inspirasi',
    color: '#8B5CF6',
    liked: false,
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(15,30,56,0.95) 100%)',
  },
  {
    id: '5',
    text: 'Usaha hari ini adalah pelaburan terbaik untuk masa depan. Jangan berhenti bermimpi, teruskan berusaha.',
    author: 'Yayasan Perak',
    category: 'Motivasi',
    color: '#F97316',
    liked: false,
    bg: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(15,30,56,0.95) 100%)',
  },
  {
    id: '6',
    text: 'Pendidikan adalah hak setiap anak. Yayasan Perak komited untuk memastikan tiada seorang pun yang tertinggal.',
    author: 'Yayasan Perak',
    category: 'Pendidikan',
    color: '#EC4899',
    liked: false,
    bg: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(15,30,56,0.95) 100%)',
  },
  {
    id: '7',
    text: '"Sesungguhnya Allah tidak mengubah keadaan sesuatu kaum kecuali mereka mengubah keadaan yang ada pada diri mereka sendiri." - Surah Ar-Ra\'d: 11',
    author: 'Al-Quran',
    category: 'Agama',
    color: '#F5A623',
    liked: false,
    bg: 'linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(10,22,40,0.98) 100%)',
  },
  {
    id: '8',
    text: 'Benih yang ditanam hari ini akan menjadi pohon yang berbuah esok. Tanamkan ilmu, siram dengan usaha, suburkan dengan doa.',
    author: 'Yayasan Perak',
    category: 'Inspirasi',
    color: '#10B981',
    liked: false,
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(15,30,56,0.95) 100%)',
  },
];

const categories = ['Semua', 'Motivasi', 'Pendidikan', 'Komuniti', 'Inspirasi', 'Agama'];

function QuoteCard({ quote, index, onLike }: { quote: typeof mockQuotes[0], index: number, onLike: (id: string) => void }) {
  const [shared, setShared] = useState(false);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 80 * index);
  }, [index]);

  const handleShare = () => {
    navigator.clipboard?.writeText(`"${quote.text}" — ${quote.author}`);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div
      className="card"
      style={{
        padding: 0, overflow: 'hidden',
        background: quote.bg,
        border: `1px solid ${quote.color}25`,
        opacity: animated ? 1 : 0,
        transform: animated ? 'translateY(0)' : 'translateY(28px)',
        transition: `all 0.5s ease`,
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${quote.color}, transparent)` }} />

      <div style={{ padding: '28px' }}>
        {/* Quote icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${quote.color}20`, border: `1px solid ${quote.color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <Quote size={22} style={{ color: quote.color }} />
        </div>

        {/* Category badge */}
        <span style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: 100,
          background: `${quote.color}18`, border: `1px solid ${quote.color}40`,
          color: quote.color, fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16,
        }}>
          {quote.category}
        </span>

        {/* Quote text */}
        <p style={{
          fontSize: 'clamp(0.95rem,2vw,1.05rem)', lineHeight: 1.8, fontStyle: 'italic',
          color: 'var(--text-primary)', fontWeight: 500, marginBottom: 20,
          letterSpacing: '0.01em',
        }}>
          "{quote.text}"
        </p>

        {/* Author */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `${quote.color}22`, border: `1px solid ${quote.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={14} style={{ color: quote.color }} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', flex: 1 }}>
            — {quote.author}
          </span>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onLike(quote.id)}
              title="Suka"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: quote.liked ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${quote.liked ? 'rgba(236,72,153,0.5)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <Heart size={14} style={{ color: quote.liked ? '#EC4899' : 'var(--text-muted)', fill: quote.liked ? '#EC4899' : 'none' }} />
            </button>
            <button
              onClick={handleShare}
              title="Salin"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: shared ? `${quote.color}20` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${shared ? quote.color + '50' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <Share2 size={14} style={{ color: shared ? quote.color : 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {shared && (
          <div style={{
            marginTop: 10, fontSize: '0.76rem', color: quote.color,
            textAlign: 'right', fontWeight: 600,
          }}>
            ✓ Disalin ke papan klip!
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState(mockQuotes);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [headerAnimated, setHeaderAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeaderAnimated(true), 100);
  }, []);

  const handleLike = (id: string) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, liked: !q.liked } : q));
  };

  const filtered = activeCategory === 'Semua'
    ? quotes
    : quotes.filter(q => q.category === activeCategory);

  const featuredQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <>
      {/* Hero */}
      <section style={{
        padding: '80px 0 48px',
        background: 'linear-gradient(180deg, var(--navy) 0%, var(--navy-mid) 100%)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: -80, left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container">
          <Link href="/info" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: 24 }}>
            <ArrowLeft size={15} /> Kembali ke Info
          </Link>

          <div style={{
            opacity: headerAnimated ? 1 : 0,
            transform: headerAnimated ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.6s ease',
          }}>
            <div className="section-label" style={{ marginBottom: 16 }}>
              <Sparkles size={15} /> YP Quotes
            </div>
            <h1 className="heading-lg" style={{ marginBottom: 12 }}>
              Kata-kata <span className="gradient-text">Ilham</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7 }}>
              Koleksi kata-kata perangsang, inspirasi dan motivasi daripada Yayasan Perak untuk mendorong semangat anda.
            </p>
          </div>

          {/* Featured Quote Banner */}
          <div style={{
            marginTop: 40,
            padding: '28px 32px',
            background: 'linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(245,166,35,0.2)',
            borderRadius: 'var(--radius-lg)',
            position: 'relative', overflow: 'hidden',
            opacity: headerAnimated ? 1 : 0,
            transform: headerAnimated ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease 0.2s',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: 'rgba(245,166,35,0.18)', border: '1px solid rgba(245,166,35,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={24} style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Quote Hari Ini
                </div>
                <p style={{ fontSize: 'clamp(0.9rem,2.2vw,1.1rem)', fontStyle: 'italic', lineHeight: 1.75, color: 'var(--text-primary)', fontWeight: 500 }}>
                  "Toughest moments are the ones that build the strongest character."
                </p>
                <p style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  — Yayasan Perak
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quotes Grid */}
      <section className="section">
        <div className="container">
          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 18px', borderRadius: 100, border: '1px solid',
                  borderColor: activeCategory === cat ? 'var(--gold)' : 'var(--border)',
                  background: activeCategory === cat ? 'rgba(245,166,35,0.15)' : 'transparent',
                  color: activeCategory === cat ? 'var(--gold)' : 'var(--text-secondary)',
                  fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {filtered.map((quote, i) => (
              <QuoteCard key={quote.id} quote={quote} index={i} onLike={handleLike} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Quote size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>Tiada quotes dalam kategori ini buat masa ini.</p>
            </div>
          )}

          {/* Link to Info */}
          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <Link href="/info" className="btn btn-secondary">
              <ArrowLeft size={16} /> Kembali ke Info Terkini
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
