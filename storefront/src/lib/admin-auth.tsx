'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { adminMedusa } from './admin-supabase'

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

  const doLogout = useCallback(async () => {
    await adminMedusa.logout()
    setAuthed(false)
    setEmail(null)
    setDemo(false)
  }, [])

  useEffect(() => {
    adminMedusa.setOnUnauthorized(() => {
      doLogout()
    })

    async function init() {
      const online = await adminMedusa.healthCheck()
      setBackendOnline(online)

      const authenticated = await adminMedusa.isAuthenticated()
      if (authenticated) {
        const valid = await adminMedusa.verifyToken()
        if (valid) {
          setAuthed(true)
          const { data } = await adminMedusa.getSupabase().auth.getSession()
          setEmail(data.session?.user?.email || null)
        } else {
          await adminMedusa.logout()
        }
      }
      setReady(true)
    }
    init()
  }, [doLogout])

  async function login(em: string, pw: string) {
    await adminMedusa.login(em, pw)
    setAuthed(true)
    setEmail(em)
    setDemo(false)
  }

  function enterDemo() {
    setDemo(true)
    setAuthed(true)
    setEmail('demo@aksafashion.com')
  }

  return (
    <Ctx.Provider value={{ ready, authed, demo, email, backendOnline, login, logout: doLogout, enterDemo }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdminAuth must be within AdminAuthProvider')
  return ctx
}
