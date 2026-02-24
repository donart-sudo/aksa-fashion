'use client'

import type { StoreSettingsData } from '../types'
import { SettingsCard, SettingsToggleRow } from '../components/SettingsUI'

export default function CheckoutSection({ settings, onChange }: {
  settings: StoreSettingsData
  onChange: <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => void
}) {
  return (
    <SettingsCard title="Checkout" description="Configure your checkout experience.">
      <div className="space-y-3">
        <SettingsToggleRow
          label="Guest checkout"
          description="Allow customers to check out without creating an account"
          checked={settings.guestCheckout}
          onChange={() => onChange('guestCheckout', !settings.guestCheckout)}
        />
        <SettingsToggleRow
          label="Require phone number"
          description="Phone number is required at checkout for delivery coordination"
          checked={settings.requirePhone}
          onChange={() => onChange('requirePhone', !settings.requirePhone)}
        />
        <SettingsToggleRow
          label="Order notes"
          description="Allow customers to add notes to their order (e.g. wedding date, alterations)"
          checked={settings.orderNotes}
          onChange={() => onChange('orderNotes', !settings.orderNotes)}
        />
        <SettingsToggleRow
          label="Auto-confirm orders"
          description="Automatically confirm orders when payment is received"
          checked={settings.autoConfirm}
          onChange={() => onChange('autoConfirm', !settings.autoConfirm)}
        />
      </div>
    </SettingsCard>
  )
}
