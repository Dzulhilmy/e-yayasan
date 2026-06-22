'use client'

import { useState, use } from 'react'
import { signup } from '../login/actions'
import Link from 'next/link'
import { Eye, EyeOff, Mail } from 'lucide-react'

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; error: string }>
}) {
  const params = use(searchParams)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh', background: 'var(--navy)', padding: '0 24px' }}>
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
          <h2 className="heading-lg">Daftar Akaun Baru</h2>
          <p className="text-muted mt-2">Sertai portal digital Yayasan Perak hari ini</p>
        </div>

        <div className="divider" style={{ margin: '40px 0' }}>Gunakan emel</div>

        <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="full_name" className="input-label">Nama Penuh</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Nama Penuh"
                />
              </div>
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
                  autoComplete="new-password"
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

          {params?.error && (
            <div className="badge-red" style={{ padding: '12px', borderRadius: 8, display: 'block', textAlign: 'center' }}>
              {params.error}
            </div>
          )}
          
          {params?.message && (
            <div className="badge-green" style={{ padding: '12px', borderRadius: 8, display: 'block', textAlign: 'center' }}>
              {params.message}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              formAction={signup}
              className="btn btn-primary btn-lg w-full justify-center"
            >
              Daftar Sekarang
            </button>
            <div className="text-center mt-4">
              <span className="text-muted">Sudah mempunyai akaun? </span>
              <Link href="/login" className="text-gold" style={{ fontWeight: 600 }}>
                Log Masuk
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
