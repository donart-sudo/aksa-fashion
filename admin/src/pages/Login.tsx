import { useState } from 'react'
import { Sparkles, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login, enterDemo, backendOnline } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-nav flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <span className="text-[20px] font-semibold text-white">Aksa Fashion</span>
        </div>

        {/* Login card */}
        <div className="card p-6">
          <h1 className="text-[16px] font-semibold text-ink mb-1">Log in</h1>
          <p className="text-[13px] text-ink-light mb-5">
            Continue to Aksa Fashion admin
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-crit-surface text-crit-text text-[13px] mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aksafashion.com"
                className="input w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input w-full"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {!backendOnline && (
            <p className="text-[12px] text-warn-text bg-warn-surface rounded-lg p-2.5 mt-4 text-center">
              Backend is offline. Start it with: cd backend && npx medusa develop
            </p>
          )}
        </div>

        {/* Demo mode */}
        <div className="mt-4 text-center">
          <button
            onClick={enterDemo}
            className="text-[13px] text-white/60 hover:text-white/90 underline underline-offset-2 transition-colors"
          >
            Continue with demo data
          </button>
        </div>
      </div>
    </div>
  )
}
