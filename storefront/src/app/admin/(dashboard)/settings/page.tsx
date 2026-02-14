'use client'

import { useState } from 'react'
import { Save, Store, Globe, CreditCard, Bell, Palette, Check } from 'lucide-react'
import TopBar from '@/components/admin/TopBar'

interface StoreSettings {
  storeName: string; email: string; phone: string; address: string; city: string; country: string
  currency: string; language: string; taxRate: string; enableTax: boolean
  emailNotifications: boolean; orderNotifications: boolean; lowStockAlerts: boolean; marketingEmails: boolean
  theme: 'light' | 'dark'; accentColor: string
}

const init: StoreSettings = {
  storeName: 'Aksa Fashion', email: 'info@aksafashion.com', phone: '+383 44 000 000',
  address: 'Rr. Nena Tereze 25', city: 'Prishtina', country: 'Kosovo',
  currency: 'EUR', language: 'sq', taxRate: '18', enableTax: true,
  emailNotifications: true, orderNotifications: true, lowStockAlerts: true, marketingEmails: false,
  theme: 'light', accentColor: '#303030',
}

const sections = [
  { id: 'store', label: 'Store details', icon: Store },
  { id: 'regional', label: 'Regional', icon: Globe },
  { id: 'tax', label: 'Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

export default function AdminSettingsPage() {
  const [s, setS] = useState<StoreSettings>(init)
  const [active, setActive] = useState('store')
  const [saved, setSaved] = useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  function set<K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) { setS(p => ({ ...p, [k]: v })) }

  return (
    <>
      <TopBar title="Settings" />
      <div className="p-6">
        <div className="max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <nav className="lg:col-span-1 card p-1.5 space-y-0.5 self-start lg:sticky lg:top-[72px]">
              {sections.map(sec => (
                <button key={sec.id} onClick={() => setActive(sec.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${active === sec.id ? 'bg-card-hover text-ink' : 'text-ink-light hover:text-ink hover:bg-card-hover'}`}>
                  <sec.icon className="w-4 h-4" />{sec.label}
                </button>
              ))}
            </nav>

            <div className="lg:col-span-3 space-y-4">
              {active === 'store' && (
                <div className="card p-5">
                  <h3 className="text-[15px] font-semibold text-ink mb-1">Store details</h3>
                  <p className="text-[13px] text-ink-light mb-5">Basic information about your store.</p>
                  <div className="space-y-3">
                    <div><label className="block text-[13px] font-medium text-ink mb-1">Store name</label><input value={s.storeName} onChange={e => set('storeName', e.target.value)} className="input w-full" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[13px] font-medium text-ink mb-1">Email</label><input type="email" value={s.email} onChange={e => set('email', e.target.value)} className="input w-full" /></div>
                      <div><label className="block text-[13px] font-medium text-ink mb-1">Phone</label><input value={s.phone} onChange={e => set('phone', e.target.value)} className="input w-full" /></div>
                    </div>
                    <div><label className="block text-[13px] font-medium text-ink mb-1">Address</label><input value={s.address} onChange={e => set('address', e.target.value)} className="input w-full" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[13px] font-medium text-ink mb-1">City</label><input value={s.city} onChange={e => set('city', e.target.value)} className="input w-full" /></div>
                      <div><label className="block text-[13px] font-medium text-ink mb-1">Country</label><input value={s.country} onChange={e => set('country', e.target.value)} className="input w-full" /></div>
                    </div>
                  </div>
                </div>
              )}

              {active === 'regional' && (
                <div className="card p-5">
                  <h3 className="text-[15px] font-semibold text-ink mb-1">Regional settings</h3>
                  <p className="text-[13px] text-ink-light mb-5">Currency and language preferences.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[13px] font-medium text-ink mb-1">Currency</label>
                      <select value={s.currency} onChange={e => set('currency', e.target.value)} className="input w-full">
                        <option value="EUR">EUR &mdash; Euro</option><option value="USD">USD &mdash; Dollar</option><option value="ALL">ALL &mdash; Lek</option><option value="TRY">TRY &mdash; Lira</option>
                      </select></div>
                    <div><label className="block text-[13px] font-medium text-ink mb-1">Language</label>
                      <select value={s.language} onChange={e => set('language', e.target.value)} className="input w-full">
                        <option value="sq">Albanian</option><option value="en">English</option><option value="tr">Turkish</option><option value="ar">Arabic</option>
                      </select></div>
                  </div>
                </div>
              )}

              {active === 'tax' && (
                <div className="card p-5">
                  <h3 className="text-[15px] font-semibold text-ink mb-1">Payments</h3>
                  <p className="text-[13px] text-ink-light mb-5">Tax and payment configuration.</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card-hover rounded-lg">
                      <div><p className="text-[13px] font-medium text-ink">Collect tax</p><p className="text-[12px] text-ink-light">Auto-calculate tax on orders</p></div>
                      <button onClick={() => set('enableTax', !s.enableTax)} className={`toggle ${s.enableTax ? 'active' : ''}`} />
                    </div>
                    {s.enableTax && (
                      <div className="max-w-[200px]"><label className="block text-[13px] font-medium text-ink mb-1">Tax rate (%)</label><input type="number" value={s.taxRate} onChange={e => set('taxRate', e.target.value)} className="input w-full" /></div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-card-hover rounded-lg">
                      <CreditCard className="w-5 h-5 text-ink-faint" />
                      <div><p className="text-[13px] font-medium text-ink">Stripe</p><p className="text-[12px] text-ink-light">Payment processor connected</p></div>
                      <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-ok-text bg-ok-surface px-2 py-0.5 rounded-full"><Check className="w-3 h-3" />Connected</span>
                    </div>
                  </div>
                </div>
              )}

              {active === 'notifications' && (
                <div className="card p-5">
                  <h3 className="text-[15px] font-semibold text-ink mb-1">Notifications</h3>
                  <p className="text-[13px] text-ink-light mb-5">Control what you get notified about.</p>
                  <div className="space-y-2">
                    {([
                      { key: 'emailNotifications' as const, label: 'Email notifications', desc: 'Receive email alerts' },
                      { key: 'orderNotifications' as const, label: 'New order alerts', desc: 'Get notified on new orders' },
                      { key: 'lowStockAlerts' as const, label: 'Low stock alerts', desc: 'Alert when inventory is low' },
                      { key: 'marketingEmails' as const, label: 'Marketing emails', desc: 'Tips and product updates' },
                    ]).map(item => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-card-hover rounded-lg">
                        <div><p className="text-[13px] font-medium text-ink">{item.label}</p><p className="text-[12px] text-ink-light">{item.desc}</p></div>
                        <button onClick={() => set(item.key, !s[item.key])} className={`toggle ${s[item.key] ? 'active' : ''}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {active === 'appearance' && (
                <div className="card p-5">
                  <h3 className="text-[15px] font-semibold text-ink mb-1">Appearance</h3>
                  <p className="text-[13px] text-ink-light mb-5">Customize your admin panel.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-ink mb-2">Theme</label>
                      <div className="flex gap-3">
                        {(['light', 'dark'] as const).map(t => (
                          <button key={t} onClick={() => set('theme', t)}
                            className={`flex-1 p-3 rounded-xl border-2 transition-colors ${s.theme === t ? 'border-ink' : 'border-edge hover:border-edge-dark'}`}>
                            <div className={`w-full h-12 rounded-lg mb-2 ${t === 'light' ? 'bg-page border border-edge' : 'bg-nav'}`} />
                            <p className="text-[13px] font-medium text-ink capitalize">{t}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink mb-2">Accent color</label>
                      <div className="flex gap-2">
                        {['#303030', '#008060', '#005bd3', '#d72c0d', '#b98900', '#B8926A'].map(c => (
                          <button key={c} onClick={() => set('accentColor', c)}
                            className={`w-9 h-9 rounded-full border-2 transition-transform ${s.accentColor === c ? 'border-ink scale-110' : 'border-transparent'}`}
                            style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                {saved && <span className="text-[13px] font-medium text-ok flex items-center gap-1"><Check className="w-3.5 h-3.5" />Saved</span>}
                <button onClick={save} className="btn btn-primary"><Save className="w-4 h-4" />Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
