'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Eye, EyeOff, Store, Loader2, Lock } from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth'

export default function AdminLoginPage() {
  const { login, enterDemo, backendOnline, ready, authed } = useAdminAuth()
  const router = useRouter()
  const [email, setEmail] = useState('admin@aksafashion.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ready && authed) {
      router.replace('/admin')
    }
  }, [ready, authed, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  function handleDemo() {
    enterDemo()
    router.push('/admin')
  }

  if (!ready) {
    return (
      <div className="login-page">
        <div className="login-loader">
          <Loader2 className="login-spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="login-page-v2">
      {/* Left panel — brand */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-brand-logo">
            <Store size={22} strokeWidth={2} />
          </div>
          <h1 className="login-brand-name">Aksa Fashion</h1>
          <p className="login-brand-tagline">Admin Dashboard</p>
        </div>
        <p className="login-brand-footer">Luxury Bridal &middot; Prishtina, Kosovo</p>
      </div>

      {/* Right panel — form */}
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          {/* Mobile brand */}
          <div className="login-mobile-brand">
            <div className="login-brand-logo login-brand-logo--sm">
              <Store size={16} strokeWidth={2.2} />
            </div>
            <span className="login-mobile-brand-text">Aksa Fashion</span>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-subtitle">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle className="login-error-icon" />
              <span>{error}</span>
            </div>
          )}

          {!backendOnline && (
            <div className="login-warning">
              <span className="login-warning-dot" />
              <span>Database offline — check connection</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email" className="login-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="login-input"
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">Password</label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="login-input login-input-pw"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye-btn"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="login-eye-icon" />
                    : <Eye className="login-eye-icon" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="login-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="login-submit-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  <Lock size={14} strokeWidth={2.5} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="login-secure-note">
            <Lock size={12} strokeWidth={2} />
            <span>Secured with Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  )
}
