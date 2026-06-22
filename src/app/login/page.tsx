'use client';

import { useState, use } from 'react'
import { login } from './actions'
import Link from 'next/link'
import { Eye, EyeOff, Smartphone, Mail, Globe, ArrowLeft } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; error: string }>
}) {
  const params = use(searchParams)
  const [showPassword, setShowPassword] = useState(false)
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh', background: 'var(--navy)', padding: '0 24px' }}>
      <div className="w-full flex justify-start mb-4" style={{ maxWidth: 450 }}>
        <Link href="/" className="btn btn-ghost btn-sm" style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={18} style={{ marginRight: 6 }} />
          Kembali ke Utama
        </Link>
      </div>
      <div className="card-glass w-full" style={{ maxWidth: 450 }}>
        <div className="text-center">
          <div className="animate-float" style={{ marginBottom: 24, display: 'inline-flex' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              padding: 10, flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
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
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(245,166,35,0.3)'
            }}>
              <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--navy)' }}>e-YP</span>
            </div>
          </div>
          <h2 className="heading-lg">Log Masuk Akaun</h2>
          <p className="text-muted mt-2">Sila pilih kaedah log masuk pilihan anda</p>
        </div>

        {/* Auth Method Tabs */}
        <div className="tabs mt-8">
          <button 
            className={`tab-btn flex-1 ${authMethod === 'email' ? 'active' : ''}`}
            onClick={() => setAuthMethod('email')}
          >
            <Mail size={16} style={{ marginRight: 8 }} />
            Emel
          </button>
          <button 
            className={`tab-btn flex-1 ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setAuthMethod('phone')}
          >
            <Smartphone size={16} style={{ marginRight: 8 }} />
            Telefon
          </button>
        </div>

        <div className="mt-8">
          {authMethod === 'email' ? (
            <form className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="input-label">Alamat Emel</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input-field"
                    placeholder="emel@contoh.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="input-label">Kata Laluan</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="input-field"
                      placeholder="••••••••"
                      style={{ paddingRight: 48 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ 
                        position: 'absolute', 
                        right: 12, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        padding: 4
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                formAction={login}
                className="btn btn-primary btn-lg w-full justify-center"
              >
                Log Masuk
              </button>
            </form>
          ) : (
            <form className="flex flex-col gap-6">
              <div>
                <label htmlFor="phone" className="input-label">Nombor Telefon</label>
                <div className="flex gap-3">
                  <div className="input-field" style={{ width: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy-mid)' }}>
                    +60
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="input-field flex-1"
                    placeholder="123456789"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Kod pengesahan (OTP) akan dihantar melalui SMS.
                </p>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full justify-center"
                  disabled
                >
                  Hantar OTP
                </button>
                <div className="badge-purple text-center" style={{ padding: '10px 12px', fontSize: '0.8rem' }}>
                  Fitur SMS OTP dalam pembangunan
                </div>
              </div>
            </form>
          )}
        </div>

        

        {params?.error && (
          <div className="badge-red mt-6" style={{ padding: '12px', borderRadius: 8, display: 'block', textAlign: 'center' }}>
            {params.error}
          </div>
        )}
        
        {params?.message && (
          <div className="badge-green mt-6" style={{ padding: '12px', borderRadius: 8, display: 'block', textAlign: 'center' }}>
            {params.message}
          </div>
        )}

        <div className="text-center mt-8">
          <span className="text-muted">Belum mempunyai akaun? </span>
          <Link href="/signup" className="text-gold" style={{ fontWeight: 600 }}>
            Daftar Akaun
          </Link>
        </div>
      </div>
    </div>
  )
}
