'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, Store, Palette, CreditCard, ShoppingCart, Truck, Receipt, Bell, Globe, FileText, Users, Loader2, Check, AlertTriangle } from 'lucide-react'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-supabase'
import { type StoreSettingsData, type AdminUser, DEFAULT_SETTINGS, metadataToSettings, settingsToMetadata } from './types'

import StoreDetailsSection from './sections/StoreDetailsSection'
import BrandSection from './sections/BrandSection'
import PaymentsSection from './sections/PaymentsSection'
import CheckoutSection from './sections/CheckoutSection'
import ShippingSection from './sections/ShippingSection'
import TaxesSection from './sections/TaxesSection'
import NotificationsSection from './sections/NotificationsSection'
import LanguagesSection from './sections/LanguagesSection'
import PoliciesSection from './sections/PoliciesSection'
import UsersSection from './sections/UsersSection'

const sections = [
  { id: 'store', label: 'Store details', icon: Store },
  { id: 'brand', label: 'Brand', icon: Palette },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'checkout', label: 'Checkout', icon: ShoppingCart },
  { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
  { id: 'taxes', label: 'Taxes', icon: Receipt },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'languages', label: 'Languages', icon: Globe },
  { id: 'policies', label: 'Policies', icon: FileText },
  { id: 'users', label: 'Users & Permissions', icon: Users },
]

type Toast = { type: 'success' | 'error'; message: string } | null

export default function AdminSettingsPage() {
  const { demo } = useAdminAuth()
  const [active, setActive] = useState('store')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast>(null)
  const [settings, setSettings] = useState<StoreSettingsData>({ ...DEFAULT_SETTINGS })
  const [savedSnapshot, setSavedSnapshot] = useState<string>('')
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const isDirty = JSON.stringify(settings) !== savedSnapshot

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, message })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  // Load settings on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (demo) {
        setSettings({ ...DEFAULT_SETTINGS })
        setSavedSnapshot(JSON.stringify(DEFAULT_SETTINGS))
        setLoading(false)
        return
      }
      try {
        const data = await adminMedusa.getStoreSettings()
        if (cancelled) return
        const parsed = metadataToSettings(data.metadata)
        // Use store name from the row itself as a fallback
        if (data.name && !data.metadata?.storeName) parsed.storeName = data.name
        setSettings(parsed)
        setSavedSnapshot(JSON.stringify(parsed))
      } catch (err) {
        if (!cancelled) showToast('error', 'Failed to load settings')
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [demo, showToast])

  // Load admin users when Users section is active
  useEffect(() => {
    if (active !== 'users' || demo) return
    let cancelled = false
    async function loadUsers() {
      setUsersLoading(true)
      try {
        const data = await adminMedusa.getAdminUsers()
        if (!cancelled) setAdminUsers(data as AdminUser[])
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setUsersLoading(false)
      }
    }
    loadUsers()
    return () => { cancelled = true }
  }, [active, demo])

  function handleChange<K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (demo) {
      showToast('error', 'Settings are not persisted in demo mode')
      return
    }
    setSaving(true)
    try {
      await adminMedusa.updateStoreSettings(settingsToMetadata(settings))
      setSavedSnapshot(JSON.stringify(settings))
      showToast('success', 'Settings saved successfully')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Settings" />
        <div className="p-8 flex justify-center pt-24">
          <Loader2 className="w-6 h-6 animate-spin text-[#8a8a8a]" />
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar
        title="Settings"
        actions={
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-[12px] font-medium text-[#b28400] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#b28400]" />
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="btn btn-primary"
              style={{ opacity: isDirty ? 1 : 0.5 }}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save changes</>
              )}
            </button>
          </div>
        }
      />

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-[12px] shadow-lg text-[13px] font-medium animate-in slide-in-from-top-2"
          style={{
            background: toast.type === 'success' ? '#ecfdf5' : '#fee8eb',
            color: toast.type === 'success' ? '#047b5d' : '#e22c38',
            border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fca5a5'}`,
          }}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="p-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar nav */}
          <nav className="col-span-1 bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-2 space-y-0.5 self-start sticky top-[72px]">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActive(sec.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors border-none cursor-pointer"
                style={{
                  background: active === sec.id ? '#f1f1f1' : 'transparent',
                  color: active === sec.id ? '#1a1a1a' : '#616161',
                }}
                onMouseEnter={e => { if (active !== sec.id) { e.currentTarget.style.background = '#f6f6f6'; e.currentTarget.style.color = '#1a1a1a' } }}
                onMouseLeave={e => { if (active !== sec.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#616161' } }}
              >
                <sec.icon className="w-4 h-4" />{sec.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="col-span-3">
            {active === 'store' && <StoreDetailsSection settings={settings} onChange={handleChange} />}
            {active === 'brand' && <BrandSection settings={settings} onChange={handleChange} />}
            {active === 'payments' && <PaymentsSection settings={settings} onChange={handleChange} />}
            {active === 'checkout' && <CheckoutSection settings={settings} onChange={handleChange} />}
            {active === 'shipping' && <ShippingSection settings={settings} onChange={handleChange} />}
            {active === 'taxes' && <TaxesSection settings={settings} onChange={handleChange} />}
            {active === 'notifications' && <NotificationsSection settings={settings} onChange={handleChange} />}
            {active === 'languages' && <LanguagesSection settings={settings} onChange={handleChange} />}
            {active === 'policies' && <PoliciesSection settings={settings} onChange={handleChange} />}
            {active === 'users' && <UsersSection users={adminUsers} loading={usersLoading} />}
          </div>
        </div>
      </div>
    </>
  )
}
