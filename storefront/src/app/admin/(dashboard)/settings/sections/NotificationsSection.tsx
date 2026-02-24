'use client'

import type { StoreSettingsData } from '../types'
import { SettingsCard, SettingsLabel, SettingsInput, SettingsToggleRow } from '../components/SettingsUI'

export default function NotificationsSection({ settings, onChange }: {
  settings: StoreSettingsData
  onChange: <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => void
}) {
  return (
    <div className="space-y-5">
      <SettingsCard title="Email notifications" description="Control which email notifications you receive.">
        <div className="space-y-3">
          <SettingsToggleRow
            label="New order"
            description="Get notified when a new order is placed"
            checked={settings.notifyNewOrder}
            onChange={() => onChange('notifyNewOrder', !settings.notifyNewOrder)}
          />
          <SettingsToggleRow
            label="Order shipped"
            description="Notification when an order is shipped"
            checked={settings.notifyShipped}
            onChange={() => onChange('notifyShipped', !settings.notifyShipped)}
          />
          <SettingsToggleRow
            label="Order delivered"
            description="Notification when an order is delivered"
            checked={settings.notifyDelivered}
            onChange={() => onChange('notifyDelivered', !settings.notifyDelivered)}
          />
          <SettingsToggleRow
            label="Low stock alerts"
            description="Alert when product inventory drops below threshold"
            checked={settings.notifyLowStock}
            onChange={() => onChange('notifyLowStock', !settings.notifyLowStock)}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Sender details" description="How your notification emails appear to customers.">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SettingsLabel>Sender name</SettingsLabel>
            <SettingsInput value={settings.senderName} onChange={v => onChange('senderName', v)} placeholder="Aksa Fashion" />
          </div>
          <div>
            <SettingsLabel>Sender email</SettingsLabel>
            <SettingsInput type="email" value={settings.senderEmail} onChange={v => onChange('senderEmail', v)} placeholder="orders@aksa-fashion.com" />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="WhatsApp" description="Receive notifications via WhatsApp.">
        <SettingsToggleRow
          label="WhatsApp notifications"
          description="Get order alerts on WhatsApp (requires phone number in Store Details)"
          checked={settings.notifyWhatsapp}
          onChange={() => onChange('notifyWhatsapp', !settings.notifyWhatsapp)}
        />
      </SettingsCard>
    </div>
  )
}
