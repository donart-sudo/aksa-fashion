'use client'

import { useState } from 'react'
import { Save, Store, Globe, CreditCard, Bell, Palette, Check, Truck, Shield } from 'lucide-react'
import TopBar from '@/components/admin/TopBar'

interface StoreSettings {
  storeName: string; email: string; phone: string; address: string; city: string; country: string
  currency: string; language: string; taxRate: string; enableTax: boolean
  emailNotifications: boolean; orderNotifications: boolean; lowStockAlerts: boolean; marketingEmails: boolean
  theme: 'light' | 'dark'; accentColor: string
  freeShippingThreshold: string; standardShippingRate: string; expressShippingRate: string
}

const init: StoreSettings = {
  storeName: 'Aksa Fashion', email: 'info@aksafashion.com', phone: '+383 44 000 000',
  address: 'Rr. Nena Tereze 25', city: 'Prishtina', country: 'Kosovo',
  currency: 'EUR', language: 'sq', taxRate: '18', enableTax: true,
  emailNotifications: true, orderNotifications: true, lowStockAlerts: true, marketingEmails: false,
  theme: 'light', accentColor: '#303030',
  freeShippingThreshold: '15000', standardShippingRate: '500', expressShippingRate: '1200',
}

const sections = [
  { id: 'store', label: 'Store details', icon: Store },
  { id: 'regional', label: 'Regional', icon: Globe },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'tax', label: 'Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

function SettingsBadge({ children, variant }: { children: React.ReactNode; variant: string }) {
  const bg = variant === 'success' ? '#cdfed4' : '#f1f1f1'
  const color = variant === 'success' ? '#014b40' : '#616161'
  return (
    <span
      className="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-semibold"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative w-[44px] h-[24px] rounded-full border-none cursor-pointer shrink-0 transition-colors duration-200"
      style={{ background: checked ? '#047b5d' : '#d1d1d1' }}
    >
      <span
        className="absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform duration-200"
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}

export default function AdminSettingsPage() {
  const [s, setS] = useState<StoreSettings>(init)
  const [active, setActive] = useState('store')
  const [saved, setSaved] = useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  function set<K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) { setS(p => ({ ...p, [k]: v })) }

  return (
    <>
      <TopBar title="Settings" actions={
        <div className="flex items-center gap-2">
          {saved && <span className="text-[13px] font-medium flex items-center gap-1" style={{ color: '#047b5d' }}><Check className="w-3.5 h-3.5" />Saved</span>}
          <button onClick={save} className="btn btn-primary"><Save className="w-4 h-4" />Save changes</button>
        </div>
      } />
      <div className="p-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar nav */}
          <nav className="col-span-1 bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-2 space-y-0.5 self-start sticky top-[72px]">
            {sections.map(sec => (
              <button key={sec.id} onClick={() => setActive(sec.id)}
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
          <div className="col-span-3 space-y-5">
            {active === 'store' && (
              <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-6">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1">Store details</h3>
                <p className="text-[13px] text-[#616161] mb-6">Basic information about your store.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Store name</label>
                    <input value={s.storeName} onChange={e => set('storeName', e.target.value)} className="input w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Email</label>
                      <input type="email" value={s.email} onChange={e => set('email', e.target.value)} className="input w-full" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Phone</label>
                      <input value={s.phone} onChange={e => set('phone', e.target.value)} className="input w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Address</label>
                    <input value={s.address} onChange={e => set('address', e.target.value)} className="input w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">City</label>
                      <input value={s.city} onChange={e => set('city', e.target.value)} className="input w-full" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Country</label>
                      <input value={s.country} onChange={e => set('country', e.target.value)} className="input w-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === 'regional' && (
              <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-6">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1">Regional settings</h3>
                <p className="text-[13px] text-[#616161] mb-6">Currency and language preferences.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Currency</label>
                    <select value={s.currency} onChange={e => set('currency', e.target.value)} className="input w-full">
                      <option value="EUR">EUR — Euro</option>
                      <option value="USD">USD — Dollar</option>
                      <option value="ALL">ALL — Lek</option>
                      <option value="TRY">TRY — Lira</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Language</label>
                    <select value={s.language} onChange={e => set('language', e.target.value)} className="input w-full">
                      <option value="sq">Albanian</option>
                      <option value="en">English</option>
                      <option value="tr">Turkish</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {active === 'shipping' && (
              <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-6">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1">Shipping</h3>
                <p className="text-[13px] text-[#616161] mb-6">Configure shipping rates and zones.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Free shipping threshold</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8a8a8a]">&euro;</span>
                        <input type="number" value={s.freeShippingThreshold} onChange={e => set('freeShippingThreshold', e.target.value)} className="input w-full pl-7" />
                      </div>
                      <p className="text-[11px] text-[#b5b5b5] mt-1">Minimum order for free shipping</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Standard rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8a8a8a]">&euro;</span>
                        <input type="number" value={s.standardShippingRate} onChange={e => set('standardShippingRate', e.target.value)} className="input w-full pl-7" />
                      </div>
                      <p className="text-[11px] text-[#b5b5b5] mt-1">5-7 business days</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Express rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8a8a8a]">&euro;</span>
                        <input type="number" value={s.expressShippingRate} onChange={e => set('expressShippingRate', e.target.value)} className="input w-full pl-7" />
                      </div>
                      <p className="text-[11px] text-[#b5b5b5] mt-1">1-3 business days</p>
                    </div>
                  </div>
                  <div className="rounded-[12px] p-4" style={{ background: '#f9f9f9' }}>
                    <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-3">Shipping zones</p>
                    <div className="space-y-2">
                      {['Kosovo (domestic)', 'Albania, North Macedonia', 'Germany, Switzerland, Austria', 'Rest of Europe'].map(zone => (
                        <div key={zone} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #ebebeb' }}>
                          <span className="text-[13px] text-[#1a1a1a]">{zone}</span>
                          <SettingsBadge variant="success">Active</SettingsBadge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === 'tax' && (
              <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-6">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1">Payments &amp; Tax</h3>
                <p className="text-[13px] text-[#616161] mb-6">Tax and payment configuration.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-[12px]" style={{ background: '#f9f9f9' }}>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">Collect tax</p>
                      <p className="text-[12px] text-[#616161]">Auto-calculate tax on orders</p>
                    </div>
                    <ToggleSwitch checked={s.enableTax} onChange={() => set('enableTax', !s.enableTax)} />
                  </div>
                  {s.enableTax && (
                    <div className="max-w-[200px]">
                      <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">Tax rate (%)</label>
                      <input type="number" value={s.taxRate} onChange={e => set('taxRate', e.target.value)} className="input w-full" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4 rounded-[12px]" style={{ background: '#f9f9f9' }}>
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(99,91,255,0.1)' }}>
                      <CreditCard className="w-5 h-5" style={{ color: '#635bff' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">Stripe</p>
                      <p className="text-[12px] text-[#616161]">Payment processor</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#cdfed4', color: '#014b40' }}>
                      <Check className="w-3 h-3" />Connected
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-[12px]" style={{ background: '#f9f9f9' }}>
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: '#f1f1f1' }}>
                      <Shield className="w-5 h-5" style={{ color: '#8a8a8a' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">Bank Transfer</p>
                      <p className="text-[12px] text-[#616161]">Manual payment option</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#cdfed4', color: '#014b40' }}>
                      <Check className="w-3 h-3" />Enabled
                    </span>
                  </div>
                </div>
              </div>
            )}

            {active === 'notifications' && (
              <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-6">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1">Notifications</h3>
                <p className="text-[13px] text-[#616161] mb-6">Control what you get notified about.</p>
                <div className="space-y-3">
                  {([
                    { key: 'emailNotifications' as const, label: 'Email notifications', desc: 'Receive email alerts for important events' },
                    { key: 'orderNotifications' as const, label: 'New order alerts', desc: 'Get notified when a new order is placed' },
                    { key: 'lowStockAlerts' as const, label: 'Low stock alerts', desc: 'Alert when product inventory drops below threshold' },
                    { key: 'marketingEmails' as const, label: 'Marketing emails', desc: 'Tips, product updates, and platform news' },
                  ]).map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-[12px]" style={{ background: '#f9f9f9' }}>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{item.label}</p>
                        <p className="text-[12px] text-[#616161]">{item.desc}</p>
                      </div>
                      <ToggleSwitch checked={s[item.key]} onChange={() => set(item.key, !s[item.key])} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === 'appearance' && (
              <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-6">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1">Appearance</h3>
                <p className="text-[13px] text-[#616161] mb-6">Customize your admin panel.</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-3">Theme</label>
                    <div className="flex gap-4">
                      {(['light', 'dark'] as const).map(t => (
                        <button key={t} onClick={() => set('theme', t)}
                          className="flex-1 p-4 rounded-[12px] transition-all border-none cursor-pointer"
                          style={{
                            border: `2px solid ${s.theme === t ? '#1a1a1a' : '#e3e3e3'}`,
                            background: '#ffffff',
                            boxShadow: s.theme === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          <div className="w-full h-16 rounded-[10px] mb-3" style={{
                            background: t === 'light' ? '#f1f1f1' : '#1a1a1a',
                            border: t === 'light' ? '1px solid #e3e3e3' : 'none',
                          }} />
                          <p className="text-[13px] font-semibold text-[#1a1a1a] capitalize text-left">{t}</p>
                          <p className="text-[11px] text-[#8a8a8a] text-left">{t === 'light' ? 'Clean and bright' : 'Easy on the eyes'}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-3">Accent color</label>
                    <div className="flex gap-3">
                      {[
                        { color: '#303030', name: 'Charcoal' },
                        { color: '#047b5d', name: 'Emerald' },
                        { color: '#005bd3', name: 'Ocean' },
                        { color: '#8051ff', name: 'Violet' },
                        { color: '#B8926A', name: 'Gold' },
                        { color: '#e22c38', name: 'Ruby' },
                      ].map(c => (
                        <button key={c.color} onClick={() => set('accentColor', c.color)}
                          className="flex flex-col items-center gap-1.5 transition-transform border-none bg-transparent cursor-pointer"
                          style={{ transform: s.accentColor === c.color ? 'scale(1.1)' : 'scale(1)' }}
                        >
                          <div className="w-10 h-10 rounded-full" style={{
                            background: c.color,
                            border: s.accentColor === c.color ? '2px solid #1a1a1a' : '2px solid transparent',
                          }} />
                          <span className="text-[10px]" style={{ color: '#8a8a8a' }}>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
