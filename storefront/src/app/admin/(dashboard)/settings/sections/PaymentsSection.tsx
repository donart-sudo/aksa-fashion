'use client'

import { Banknote, MapPin, Globe, MessageCircle } from 'lucide-react'
import type { StoreSettingsData } from '../types'
import { SettingsCard, SettingsLabel, SettingsSelect, ToggleSwitch } from '../components/SettingsUI'

const paymentMethods = [
  { key: 'paymentBankTransfer' as const, label: 'Bank transfer', description: 'Direct bank deposit', icon: Banknote },
  { key: 'paymentCashPickup' as const, label: 'Cash on pickup', description: 'Pay at store pickup', icon: MapPin },
  { key: 'paymentWesternUnion' as const, label: 'Western Union', description: 'International transfers', icon: Globe },
  { key: 'paymentWhatsapp' as const, label: 'WhatsApp order', description: 'Order via WhatsApp chat', icon: MessageCircle },
]

const allCurrencies = [
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'ALL', label: 'ALL — Albanian Lek' },
  { value: 'TRY', label: 'TRY — Turkish Lira' },
]

export default function PaymentsSection({ settings, onChange }: {
  settings: StoreSettingsData
  onChange: <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => void
}) {
  function toggleCurrency(code: string) {
    const curr = settings.acceptedCurrencies || []
    if (curr.includes(code)) {
      if (curr.length <= 1) return
      onChange('acceptedCurrencies', curr.filter(c => c !== code))
    } else {
      onChange('acceptedCurrencies', [...curr, code])
    }
  }

  return (
    <div className="space-y-5">
      <SettingsCard title="Payment methods" description="Choose which payment methods your store accepts.">
        <div className="space-y-3">
          {paymentMethods.map(pm => (
            <div key={pm.key} className="flex items-center justify-between p-4 rounded-[12px]" style={{ background: '#f9f9f9' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: settings[pm.key] ? 'rgba(4,123,93,0.1)' : '#f1f1f1' }}>
                  <pm.icon className="w-5 h-5" style={{ color: settings[pm.key] ? '#047b5d' : '#8a8a8a' }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">{pm.label}</p>
                  <p className="text-[12px] text-[#616161]">{pm.description}</p>
                </div>
              </div>
              <ToggleSwitch checked={settings[pm.key]} onChange={() => onChange(pm.key, !settings[pm.key])} />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Currencies" description="Default and accepted currencies for your store.">
        <div className="space-y-4">
          <div>
            <SettingsLabel>Default currency</SettingsLabel>
            <SettingsSelect
              value={settings.defaultCurrency}
              onChange={v => onChange('defaultCurrency', v)}
              options={allCurrencies}
            />
          </div>
          <div>
            <SettingsLabel>Accepted currencies</SettingsLabel>
            <div className="space-y-2">
              {allCurrencies.map(c => (
                <div key={c.value} className="flex items-center justify-between py-2 px-3 rounded-[10px]" style={{ background: '#f9f9f9' }}>
                  <span className="text-[13px] text-[#1a1a1a]">{c.label}</span>
                  <ToggleSwitch
                    checked={settings.acceptedCurrencies?.includes(c.value) || false}
                    onChange={() => toggleCurrency(c.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
