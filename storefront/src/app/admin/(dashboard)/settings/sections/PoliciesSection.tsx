'use client'

import type { StoreSettingsData } from '../types'
import { SettingsCard, SettingsLabel, SettingsTextArea } from '../components/SettingsUI'

export default function PoliciesSection({ settings, onChange }: {
  settings: StoreSettingsData
  onChange: <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => void
}) {
  return (
    <div className="space-y-5">
      <SettingsCard title="Terms of service" description="Your store's terms and conditions.">
        <SettingsLabel>Terms of service</SettingsLabel>
        <SettingsTextArea
          value={settings.termsOfService}
          onChange={v => onChange('termsOfService', v)}
          rows={8}
          placeholder="Enter your terms of service..."
        />
      </SettingsCard>

      <SettingsCard title="Privacy policy" description="How you collect, use, and protect customer data.">
        <SettingsLabel>Privacy policy</SettingsLabel>
        <SettingsTextArea
          value={settings.privacyPolicy}
          onChange={v => onChange('privacyPolicy', v)}
          rows={8}
          placeholder="Enter your privacy policy..."
        />
      </SettingsCard>

      <SettingsCard title="Shipping policy" description="Shipping times, methods, and restrictions.">
        <SettingsLabel>Shipping policy</SettingsLabel>
        <SettingsTextArea
          value={settings.shippingPolicy}
          onChange={v => onChange('shippingPolicy', v)}
          rows={8}
          placeholder="Enter your shipping policy..."
        />
      </SettingsCard>
    </div>
  )
}
