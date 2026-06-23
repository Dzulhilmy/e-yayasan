'use client';

import { useState, use } from 'react'
import { login } from './actions'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; error: string }>
}) {
  const params = use(searchParams)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--navy)',
      fontFamily: "'Inter', 'Outfit', sans-serif",
    }}>

      {/* ─── LEFT PANEL — Branding ─── */}
      <div style={{
        flex: '0 0 45%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #0d1b2e 0%, #162035 50%, #1a2a45 100%)',
        borderRight: '1px solid rgba(245,166,35,0.12)',
      }} className="login-left-panel">

        <div style={{
          position: 'absolute', top: '8%', left: '10%',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,149,237,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: i % 3 === 0 ? 6 : 4,
            height: i % 3 === 0 ? 6 : 4,
            borderRadius: '50%',
            background: `rgba(245,166,35,${0.15 + (i * 0.05)})`,
            top: `${10 + (i * 10)}%`,
            left: `${5 + (i * 8) % 80}%`,
            pointerEvents: 'none',
            animation: `floatDot ${3 + i}s ease-in-out infinite alternate`,
          }} />
        ))}

        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 12, marginBottom: 28,
          boxShadow: '0 0 0 8px rgba(245,166,35,0.12), 0 16px 48px rgba(0,0,0,0.5)',
          flexShrink: 0, position: 'relative', zIndex: 1,
        }}>
          <img
            src="/yp-logo.png"
            alt="Yayasan Perak Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 320 }}>
          <h1 style={{
            fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em',
            color: 'white', margin: '0 0 8px', lineHeight: 1.1,
          }}>
            e<span style={{ color: 'var(--gold)' }}>-YP</span>
          </h1>
          <p style={{
            fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.18em',
            color: 'rgba(245,166,35,0.7)', textTransform: 'uppercase', marginBottom: 32,
          }}>
            Yayasan Perak
          </p>
          <div style={{
            width: 48, height: 2,
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            margin: '0 auto 28px',
          }} />
          <h2 style={{
            fontSize: '1.45rem', fontWeight: 700, color: 'white',
            margin: '0 0 12px', lineHeight: 1.3,
          }}>
            Portal Digital Rasmi
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7, margin: 0,
          }}>
            Akses program bantuan, pantau permohonan anda, dan urus maklumat peribadi dengan selamat.
          </p>
        </div>

        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '8px 16px', zIndex: 1,
        }}>
          <ShieldCheck size={14} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em' }}>
            Sistem Selamat & Disulitkan
          </span>
        </div>
      </div>

      {/* ─── RIGHT PANEL — Form ─── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <div style={{
          padding: '20px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.875rem', fontWeight: 500,
              textDecoration: 'none',
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'white';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
            }}
          >
            <ArrowLeft size={15} />
            Kembali ke Utama
          </Link>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 64px',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
          alignSelf: 'center',
        }} className="login-form-area">
          <div style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: '1.85rem', fontWeight: 800,
              color: 'white', margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              Log Masuk Akaun
            </h2>
          
          </div>

          {/*
            FIX: action is bound directly on the <form>, not via `formAction`
            on the submit button. When only the button carries `formAction`
            and the <form> itself has no `action`, some React 19 / Next.js
            App Router setups can dispatch the server action with an empty
            or stale FormData snapshot — which is exactly the `login({})`
            seen in the dev server logs, even though the fields were visibly
            filled in. Binding action={login} on the form guarantees the
            browser's native submit event collects every named input first.
          */}
          <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* NRIC field */}
            <div>
              <label htmlFor="nric" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.78rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.55)', marginBottom: 8,
                letterSpacing: '0.08em', textTransform: 'uppercase'
              }}>
                <CreditCard size={13} />
                No. Kad Pengenalan (NRIC)
              </label>
              <input
                id="nric"
                name="nric"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                maxLength={14}
                placeholder="000000-00-0000"
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: 'white',
                  fontSize: '1rem', outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: '0.06em',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(245,166,35,0.55)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.08)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onChange={e => {
                  const raw = e.currentTarget.value.replace(/\D/g, '').slice(0, 12)
                  let formatted = raw
                  if (raw.length > 6) formatted = raw.slice(0, 6) + '-' + raw.slice(6)
                  if (raw.length > 8) formatted = raw.slice(0, 6) + '-' + raw.slice(6, 8) + '-' + raw.slice(8)
                  e.currentTarget.value = formatted
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', marginTop: 6 }}>
                Contoh: 900101-14-5678
              </p>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" style={{
                display: 'block', fontSize: '0.78rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.55)', marginBottom: 8,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Kata Laluan
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%', padding: '13px 48px 13px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: 'white',
                    fontSize: '0.95rem', outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(245,166,35,0.55)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.08)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyi kata laluan' : 'Tunjuk kata laluan'}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)', background: 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)', padding: 4,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {params?.error && (
              <div style={{
                padding: '12px 16px', borderRadius: 9,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#f87171', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ flexShrink: 0 }}>⚠</span>
                {params.error}
              </div>
            )}

            {/* Success banner */}
            {params?.message && (
              <div style={{
                padding: '12px 16px', borderRadius: 9,
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.22)',
                color: '#4ade80', fontSize: '0.875rem',
              }}>
                {params.message}
              </div>
            )}

            {/* Submit — plain type="submit", no formAction. The form's own
                action={login} above is what fires now. */}
            <button
              type="submit"
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, var(--gold) 0%, #e6920a 100%)',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                color: 'var(--navy)', fontSize: '1rem', fontWeight: 800,
                letterSpacing: '0.02em',
                boxShadow: '0 4px 20px rgba(245,166,35,0.35)',
                transition: 'all 0.2s ease',
                marginTop: 4,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(245,166,35,0.45)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(245,166,35,0.35)';
              }}
            >
              Log Masuk
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 28,
            fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)',
            lineHeight: 1.6,
          }}>
            Masalah log masuk? Hubungi urus setia{' '}
            <Link href="/contact" style={{ color: 'rgba(245,166,35,0.7)', textDecoration: 'none' }}>
              di sini
            </Link>
            .
          </p>
        </div>
      </div>

      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes floatDot {
            from { transform: translateY(0px) scale(1); opacity: 0.4; }
            to   { transform: translateY(-14px) scale(1.3); opacity: 0.9; }
        }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #162035 inset !important;
          -webkit-text-fill-color: white !important;
        }

        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          .login-form-area  { padding: 24px 28px !important; }
        }`}
      </style>
    </div>
  )
}