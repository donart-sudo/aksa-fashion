'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { adminMedusa } from './admin-medusa'

interface AdminAuthState {
  ready: boolean
  authed: boolean
  demo: boolean
  email: string | null
  backendOnline: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  enterDemo: () => void
}

const Ctx = createContext<AdminAuthState | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [demo, setDemo] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [backendOnline, setBackendOnline] = useState(false)

  useEffect(() => {
    async function init() {
      const online = await adminMedusa.healthCheck()
      setBackendOnline(online)

      if (adminMedusa.isAuthenticated()) {
        // Restore session cookie from stored JWT token
        const restored = await adminMedusa.restoreSession()
        if (restored) {
          setAuthed(true)
          setEmail(localStorage.getItem('medusa_admin_email'))
        } else {
          // Token expired or invalid — clear it
          adminMedusa.logout()
        }
      }
      setReady(true)
    }
    init()
  }, [])

  async function login(em: string, pw: string) {
    await adminMedusa.login(em, pw)
    setAuthed(true)
    setEmail(em)
    setDemo(false)
    localStorage.setItem('medusa_admin_email', em)
  }

  function logout() {
    adminMedusa.logout()
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

export function useAdminAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdminAuth must be within AdminAuthProvider')
  return ctx
}
