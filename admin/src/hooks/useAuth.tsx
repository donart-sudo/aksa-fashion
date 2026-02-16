import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { medusa } from '../lib/medusa'

interface AuthState {
  ready: boolean
  authed: boolean
  demo: boolean
  email: string | null
  backendOnline: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  enterDemo: () => void
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [demo, setDemo] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [backendOnline, setBackendOnline] = useState(false)

  useEffect(() => {
    async function init() {
      const online = await medusa.healthCheck()
      setBackendOnline(online)

      if (medusa.isAuthenticated()) {
        setAuthed(true)
        setEmail(localStorage.getItem('medusa_admin_email'))
      }
      setReady(true)
    }
    init()
  }, [])

  async function login(em: string, pw: string) {
    await medusa.login(em, pw)
    setAuthed(true)
    setEmail(em)
    setDemo(false)
    localStorage.setItem('medusa_admin_email', em)
  }

  function logout() {
    medusa.logout()
    setAuthed(false)
    setEmail(null)
    setDemo(false)
    localStorage.removeItem('medusa_admin_email')
  }

  function enterDemo() {
    setDemo(true)
    setAuthed(true)
    setEmail('demo@aksafashion.com')
  }

  return (
    <Ctx.Provider value={{ ready, authed, demo, email, backendOnline, login, logout, enterDemo }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be within AuthProvider')
  return ctx
}
