// src/app/login/page.tsx
// e-YP Yayasan Perak — Login Page
// Two-column split layout, no main navbar, NRIC-based login.
// Self-contained — no external stores, no extra dependencies.

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── Colour tokens ────────────────────────────────────────────────────────────

const C = {
  bg:      '#0f1923',
  nav:     '#151e2b',
  input:   '#202c42',
  border:  '#253048',
  gold:    '#c9882a',
  goldHover: '#dd9933',
  goldText:'#e8a83a',
  text:    '#e8edf4',
  muted:   '#7a8caa',
  muted2:  '#4a5a72',
  red:     '#e05050',
  redBg:   '#2a1010',
  redText: '#f0a0a0',
} as const;

// ─── Inline SVG icons (no external icon package) ──────────────────────────────

const IcoArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IcoEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcoEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IcoAlert = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ─── Helper: format raw digits into NRIC pattern YYMMDD-PB-XXXX ──────────────

function formatNric(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '').slice(0, 12);
  let out = digits;
  if (digits.length > 6) out = digits.slice(0, 6) + '-' + digits.slice(6);
  if (digits.length > 8) out = out.slice(0, 9) + '-' + digits.slice(8);
  return out;
}

function isValidNricLength(value: string): boolean {
  return value.replace(/-/g, '').length === 12;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const [nric, setNric]         = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleNricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNric(formatNric(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidNricLength(nric)) {
      setError('Sila masukkan No. Kad Pengenalan yang sah (12 digit).');
      return;
    }
    if (!password) {
      setError('Sila masukkan kata laluan anda.');
      return;
    }

    setLoading(true);
    try {
      // Replace with your real auth call, e.g.:
      // const res = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nric: nric.replace(/-/g, ''), password }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message);
      // router.push('/dashboard');

      await new Promise(resolve => setTimeout(resolve, 600));
      // Demo placeholder — remove once real API is connected
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Log masuk gagal. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── No main site navbar on this page — just a small return link ── */}
      <div style={css.topBar}>
        <button style={css.backLink} onClick={() => router.push('/')}>
          <IcoArrowLeft />
          Kembali ke Laman Utama
        </button>
      </div>

      {/* ── Two-column split ── */}
      <div style={css.split}>

        {/* Left: video-background brand panel */}
        <div style={css.videoPanel}>
          {/* Replace this <video> with your actual asset.
              poster = fallback frame shown before video loads / if it fails. */}
          <video
            style={css.videoEl}
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/video/login-bg-poster.jpg"
          >
            <source src="/assets/video/login-bg.mp4" type="video/mp4" />
          </video>

          {/* Darkening overlay so text stays legible over any footage */}
          <div style={css.videoOverlay} />

          <div style={css.videoContent}>
            <div style={css.videoLogo}>
              {/* Swap for your local asset, e.g. /public/images/logo-yayasan-perak.png */}
              <img
                src="https://yayasanperak.gov.my/v7/wp-content/uploads/2021/06/cropped-Logo-Yayasan-Perak-512x512-1.png"
                alt="Logo Yayasan Perak"
                style={css.videoLogoImg}
              />
            </div>
            <div style={css.videoTitle}>Iltizam Pendidikan,<br />Transformasi Insan</div>
            <div style={css.videoSub}>
              Akses permohonan bantuan, semak status, dan urus dokumen anda dalam satu platform selamat.
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[true, false, false, false].map((on, i) => (
                <div key={i} style={{
                  width: on ? 20 : 6, height: 6, borderRadius: 3,
                  background: on ? C.goldText : 'rgba(255,255,255,0.35)',
                  transition: 'width .2s',
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: form panel */}
        <div style={css.formPanel}>
          <form style={{ width: '100%', maxWidth: 380 }} onSubmit={handleSubmit}>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: C.text, marginBottom: 6 }}>
              Log Masuk Akaun
            </h1>
            <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 32 }}>
              Sila masukkan No. Kad Pengenalan (NRIC) anda
            </p>

            {/* NRIC field */}
            <div style={{ marginBottom: 18 }}>
              <label style={css.fieldLabel} htmlFor="nric">No. Kad Pengenalan (NRIC)</label>
              <input
                id="nric"
                style={css.input}
                type="text"
                inputMode="numeric"
                placeholder="990412-05-1234"
                maxLength={14}
                value={nric}
                onChange={handleNricChange}
                autoComplete="off"
              />
              <div style={{ fontSize: 11, color: C.muted2, marginTop: 6 }}>
                Format: YYMMDD-PB-XXXX (tanpa sengkang juga diterima)
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 18 }}>
              <label style={css.fieldLabel} htmlFor="password">Kata Laluan</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  style={{ ...css.input, paddingRight: 44 }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata laluan"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <span
                  style={css.eyeBtn}
                  onClick={() => setShowPassword(v => !v)}
                  role="button"
                  aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'}
                >
                  {showPassword ? <IcoEyeOff /> : <IcoEye />}
                </span>
              </div>
            </div>

            {/* Remember + forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.muted, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: C.gold }}
                />
                Ingat saya
              </label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', fontSize: 12.5, color: C.goldText, cursor: 'pointer', padding: 0 }}
                onClick={() => router.push('/forgot-password')}
              >
                Lupa kata laluan?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" style={css.submitBtn} disabled={loading}>
              {loading ? 'Sedang log masuk...' : 'Log Masuk'}
            </button>

            {/* Error message */}
            {error && (
              <div style={css.errorBox}>
                <span style={{ color: C.red, flexShrink: 0, display: 'flex' }}><IcoAlert /></span>
                <span style={{ color: C.redText, fontSize: 13 }}>{error}</span>
              </div>
            )}

            {/* Sign up link */}
            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: C.muted }}>
              Belum mempunyai akaun?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: C.goldText, cursor: 'pointer', padding: 0, fontSize: 13 }}
                onClick={() => router.push('/register')}
              >
                Daftar Sekarang
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const css: Record<string, React.CSSProperties> = {
  topBar: {
    background: C.nav, borderBottom: `1px solid ${C.border}`,
    height: 56, display: 'flex', alignItems: 'center', padding: '0 20px',
  },
  backLink: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '7px 14px',
    color: C.muted, fontSize: 14, cursor: 'pointer',
  },
  split: {
    flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 580,
  },
  videoPanel: {
    position: 'relative', overflow: 'hidden', background: '#05080c',
  },
  videoEl: {
    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
  },
  videoOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(10,15,20,0.25) 0%, rgba(8,12,16,0.55) 65%, rgba(6,10,14,0.78) 100%)',
  },
  videoContent: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 48, textAlign: 'center',
  },
  videoLogo: {
    width: 84, height: 84, borderRadius: '50%', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28,
    overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
  },
  videoLogoImg: {
    width: '100%', height: '100%', objectFit: 'cover',
  },
  videoTitle: {
    fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 10, lineHeight: 1.3,
  },
  videoSub: {
    fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6,
    maxWidth: 320, marginBottom: 32,
  },
  formPanel: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48,
  },
  fieldLabel: {
    fontSize: 13, color: C.muted, marginBottom: 7, display: 'block', fontWeight: 500,
  },
  input: {
    width: '100%', background: C.input, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: '13px 14px', fontSize: 15, color: C.text,
    letterSpacing: '0.5px', outline: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    color: C.muted, cursor: 'pointer', display: 'flex',
  },
  submitBtn: {
    width: '100%', background: C.gold, color: '#1a1206', fontWeight: 600,
    fontSize: 15, border: 'none', borderRadius: 10, padding: 14, cursor: 'pointer',
  },
  errorBox: {
    background: C.redBg, border: '1px solid rgba(224,80,80,0.3)',
    borderRadius: 10, padding: '12px 14px', marginTop: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
};