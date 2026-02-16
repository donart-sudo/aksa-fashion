import { useState, useContext } from 'react'
import { Store, Globe, CreditCard, Bell, Palette, Users, Shield, Truck, Check } from 'lucide-react'
import { ToastContext } from '../App'

const sections = [
  { id: 'store', label: 'Store details', desc: 'Basic information about your store', icon: Store },
  { id: 'regional', label: 'Regional', desc: 'Currency & language settings', icon: Globe },
  { id: 'payments', label: 'Payments', desc: 'Payment methods & tax configuration', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', desc: 'Shipping zones & rates', icon: Truck },
  { id: 'notifications', label: 'Notifications', desc: 'Email & push notification settings', icon: Bell },
  { id: 'team', label: 'Team & permissions', desc: 'Manage staff accounts & roles', icon: Users },
  { id: 'security', label: 'Security', desc: 'Two-factor auth & session management', icon: Shield },
  { id: 'appearance', label: 'Appearance', desc: 'Theme & brand customization', icon: Palette },
]

export default function Settings() {
  const { addToast } = useContext(ToastContext)
  const [active, setActive] = useState<string | null>(null)

  if (!active) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-[18px] font-semibold text-text-primary">Settings</h2>
          <p className="text-[13px] text-text-secondary mt-1">Manage your store configuration</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActive(sec.id)}
              className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-sm hover:border-border-dark transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                  <sec.icon className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-text-primary">{sec.label}</p>
                  <p className="text-[12px] text-text-tertiary mt-0.5">{sec.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const sec = sections.find(s => s.id === active)!

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => setActive(null)}
        className="text-[13px] text-accent hover:text-accent-dark font-medium mb-4 transition-colors"
      >
        ← Back to Settings
      </button>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-[16px] font-semibold text-text-primary">{sec.label}</h3>
          <p className="text-[13px] text-text-secondary mt-0.5">{sec.desc}</p>
        </div>

        <div className="p-6">
          {active === 'store' && <StoreSection />}
          {active === 'regional' && <RegionalSection />}
          {active === 'payments' && <PaymentsSection />}
          {active === 'shipping' && <ShippingSection />}
          {active === 'notifications' && <NotificationsSection />}
          {active === 'team' && <TeamSection />}
          {active === 'security' && <SecuritySection />}
          {active === 'appearance' && <AppearanceSection />}
        </div>

        <div className="px-6 py-4 border-t border-border bg-surface/30 flex justify-end">
          <button
            onClick={() => addToast('Settings saved successfully')}
            className="h-[36px] px-5 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent-dark transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, value, type = 'text' }: { label: string; value: string; type?: string }) {
  const [v, setV] = useState(value)
  return (
    <div>
      <label className="block text-[13px] font-medium text-text-primary mb-1.5">{label}</label>
      <input type={type} value={v} onChange={e => setV(e.target.value)}
        className="w-full h-[36px] px-3 rounded-lg border border-border bg-card text-[13px] text-text-primary hover:border-border-dark transition-colors" />
    </div>
  )
}

function Toggle({ label, desc, defaultOn = true }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border/50">
      <div>
        <p className="text-[13px] font-medium text-text-primary">{label}</p>
        <p className="text-[12px] text-text-tertiary">{desc}</p>
      </div>
      <button onClick={() => setOn(!on)} className={`w-10 h-6 rounded-full transition-colors relative ${on ? 'bg-accent' : 'bg-border-dark'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  )
}

function StoreSection() {
  return (
    <div className="space-y-4">
      <InputField label="Store name" value="Aksa Fashion" />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Email" value="info@aksafashion.com" type="email" />
        <InputField label="Phone" value="+383 44 000 000" />
      </div>
      <InputField label="Address" value="Rr. Nena Tereze 25" />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="City" value="Prishtina" />
        <InputField label="Country" value="Kosovo" />
      </div>
    </div>
  )
}

function RegionalSection() {
  const [currency, setCurrency] = useState('EUR')
  const [lang, setLang] = useState('sq')
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-[13px] font-medium text-text-primary mb-1.5">Currency</label>
        <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full h-[36px] px-3 rounded-lg border border-border bg-card text-[13px]">
          <option value="EUR">EUR — Euro</option><option value="USD">USD — Dollar</option><option value="ALL">ALL — Lek</option><option value="TRY">TRY — Lira</option>
        </select>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-text-primary mb-1.5">Language</label>
        <select value={lang} onChange={e => setLang(e.target.value)} className="w-full h-[36px] px-3 rounded-lg border border-border bg-card text-[13px]">
          <option value="sq">Albanian</option><option value="en">English</option><option value="tr">Turkish</option><option value="ar">Arabic</option>
        </select>
      </div>
    </div>
  )
}

function PaymentsSection() {
  return (
    <div className="space-y-4">
      <Toggle label="Collect tax" desc="Auto-calculate tax on orders" />
      <div className="flex items-center gap-3 p-4 bg-surface/50 rounded-lg border border-border/50">
        <CreditCard className="w-5 h-5 text-text-tertiary" />
        <div className="flex-1">
          <p className="text-[13px] font-medium text-text-primary">Stripe</p>
          <p className="text-[12px] text-text-tertiary">Payment processor</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-text bg-green-bg px-2.5 py-1 rounded-full">
          <Check className="w-3 h-3" />Connected
        </span>
      </div>
    </div>
  )
}

function ShippingSection() {
  return (
    <div className="space-y-3">
      {['Kosovo', 'Albania', 'Germany', 'Switzerland'].map(zone => (
        <div key={zone} className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border/50">
          <div>
            <p className="text-[13px] font-medium text-text-primary">{zone}</p>
            <p className="text-[12px] text-text-tertiary">Standard shipping</p>
          </div>
          <span className="text-[13px] font-semibold text-text-primary">{zone === 'Kosovo' ? 'Free' : '€15.00'}</span>
        </div>
      ))}
    </div>
  )
}

function NotificationsSection() {
  return (
    <div className="space-y-3">
      <Toggle label="Email notifications" desc="Receive email alerts" />
      <Toggle label="New order alerts" desc="Get notified on new orders" />
      <Toggle label="Low stock alerts" desc="Alert when inventory is low" />
      <Toggle label="Marketing emails" desc="Tips and product updates" defaultOn={false} />
    </div>
  )
}

function TeamSection() {
  return (
    <div className="space-y-3">
      {[
        { name: 'Ridey', email: 'rideymidey@gmail.com', role: 'Owner' },
        { name: 'Aksa Admin', email: 'admin@aksafashion.com', role: 'Admin' },
      ].map(m => (
        <div key={m.email} className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
              <span className="text-[11px] font-bold text-white">{m.name[0]}</span>
            </div>
            <div>
              <p className="text-[13px] font-medium text-text-primary">{m.name}</p>
              <p className="text-[12px] text-text-tertiary">{m.email}</p>
            </div>
          </div>
          <span className="text-[12px] font-medium text-text-secondary bg-surface px-2.5 py-1 rounded-md border border-border/50">{m.role}</span>
        </div>
      ))}
    </div>
  )
}

function SecuritySection() {
  return (
    <div className="space-y-3">
      <Toggle label="Two-factor authentication" desc="Add an extra layer of security" defaultOn={false} />
      <Toggle label="Login notifications" desc="Get alerted on new sign-ins" />
    </div>
  )
}

function AppearanceSection() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [accent, setAccent] = useState('#5c6ac4')
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-text-primary mb-2">Theme</label>
        <div className="flex gap-3">
          {(['light', 'dark'] as const).map(t => (
            <button key={t} onClick={() => setTheme(t)}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme === t ? 'border-accent shadow-sm' : 'border-border hover:border-border-dark'}`}>
              <div className={`w-full h-12 rounded-lg mb-2 ${t === 'light' ? 'bg-surface border border-border' : 'bg-navy'}`} />
              <p className="text-[13px] font-medium text-text-primary capitalize">{t}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-text-primary mb-2">Accent color</label>
        <div className="flex gap-2.5">
          {['#5c6ac4', '#008060', '#2c6ecb', '#d72c0d', '#b98900', '#B8926A'].map(c => (
            <button key={c} onClick={() => setAccent(c)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${accent === c ? 'border-text-primary scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  )
}
