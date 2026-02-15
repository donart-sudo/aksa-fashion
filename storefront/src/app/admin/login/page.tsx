'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Eye, EyeOff, Store, Loader2 } from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth'

export default function AdminLoginPage() {
  const { login, enterDemo, backendOnline, ready, authed } = useAdminAuth()
  const router = useRouter()
  const [email, setEmail] = useState('admin@aksafashion.com')
  const [password, setPassword] = useState('admin')
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
    <div className="login-page">
      {/* Decorative background */}
      <div className="login-bg-top" />

      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Store strokeWidth={1.5} />
          </div>
        </div>

        {/* Card */}
        <div className="login-card">
          <h1 className="login-title">Log in to Aksa Fashion</h1>
          <p className="login-subtitle">
            Enter your credentials to access the admin dashboard
          </p>

          {error && (
            <div className="login-error">
              <AlertCircle className="login-error-icon" />
              <span>{error}</span>
            </div>
          )}

          {!backendOnline && (
            <div className="login-warning">
              <span className="login-warning-dot" />
              <span>Backend offline — start with <code>cd backend && npx medusa develop</code></span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email" className="login-label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aksafashion.com"
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
                  Logging in…
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button onClick={handleDemo} className="login-demo-btn">
            Explore with demo data
          </button>
        </div>

        {/* Footer */}
        <p className="login-footer">
          Aksa Fashion Admin &middot; Powered by Medusa
        </p>
      </div>
    </div>
  )
}
