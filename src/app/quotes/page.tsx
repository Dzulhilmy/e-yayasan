'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quote, ArrowLeft, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// ─────────────────────────────────────────────────────────────────────────
// SCHEMA MISMATCH FOUND: the real `quotes` table only has
//   id (uuid), image_url (text), created_at (timestamptz)
// There is no text/author/category/liked column at all. The previous
// version of this page rendered a rich quote-card UI (text, author,
// category badges, like/share buttons) entirely from a hardcoded
// `mockQuotes` array — none of that shape exists in the database, so
// even after wiring up a fetch, that UI could never be filled with real
// data. This version replaces it with a plain image gallery matching
// what `quotes` actually stores, and skips the section entirely if the
// table has no rows (per your request — no mock fallback).
// ─────────────────────────────────────────────────────────────────────────

interface QuoteImage {
  id: string;
  image_url: string;
  created_at: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [headerAnimated, setHeaderAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeaderAnimated(true), 100);
  }, []);

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('quotes')
          .select('id, image_url, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Gagal memuatkan quotes:', error);
          setQuotes([]);
          return;
        }

        // If there's no data, we simply leave the array empty — the
        // section below renders nothing extra, no mock fallback.
        setQuotes(data ?? []);
      } catch (err) {
        console.error('Gagal memuatkan quotes:', err);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <>
      {/* Hero */}
      <section style={{
        padding: '80px 0 48px',
        background: 'linear-gradient(180deg, var(--navy) 0%, var(--navy-mid) 100%)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
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
        </div>
      </section>

      {/* Quotes Gallery */}
      <section className="section">
        <div className="container">

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Memuatkan...
            </div>
          )}

          {!loading && quotes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Quote size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>Tiada quotes ditemui buat masa ini.</p>
            </div>
          )}

          {!loading && quotes.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}>
              {quotes.map((q, i) => (
                <div
                  key={q.id}
                  className="card"
                  style={{
                    padding: 0, overflow: 'hidden',
                    opacity: 1,
                    animation: `fadeInUp 0.5s ease ${i * 0.05}s backwards`,
                  }}
                >
                  <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--navy-mid)' }}>
                    <img
                      src={q.image_url}
                      alt="YP Quote"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '14px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(q.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <Link href="/info" className="btn btn-secondary">
              <ArrowLeft size={16} /> Kembali ke Info Terkini
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}