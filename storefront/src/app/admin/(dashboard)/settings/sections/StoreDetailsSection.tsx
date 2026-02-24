'use client'

import type { StoreSettingsData } from '../types'
import { SettingsCard, SettingsLabel, SettingsInput, SettingsSelect, SettingsTextArea } from '../components/SettingsUI'

export default function StoreDetailsSection({ settings, onChange }: {
  settings: StoreSettingsData
  onChange: <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => void
}) {
  return (
    <div className="space-y-5">
      <SettingsCard title="Store details" description="Basic information about your store.">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SettingsLabel>Store name</SettingsLabel>
              <SettingsInput value={settings.storeName} onChange={v => onChange('storeName', v)} />
            </div>
            <div>
              <SettingsLabel>Legal name</SettingsLabel>
              <SettingsInput value={settings.legalName} onChange={v => onChange('legalName', v)} placeholder="Legal business name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SettingsLabel>Email</SettingsLabel>
              <SettingsInput type="email" value={settings.email} onChange={v => onChange('email', v)} />
            </div>
            <div>
              <SettingsLabel>Phone</SettingsLabel>
              <SettingsInput value={settings.phone} onChange={v => onChange('phone', v)} />
            </div>
          </div>
          <div>
            <SettingsLabel>Description</SettingsLabel>
            <SettingsTextArea value={settings.description} onChange={v => onChange('description', v)} rows={3} placeholder="Brief store description" />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Address" description="Your store's physical location.">
        <div className="space-y-4">
          <div>
            <SettingsLabel>Address</SettingsLabel>
            <SettingsInput value={settings.address} onChange={v => onChange('address', v)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <SettingsLabel>City</SettingsLabel>
              <SettingsInput value={settings.city} onChange={v => onChange('city', v)} />
            </div>
            <div>
              <SettingsLabel>Postal code</SettingsLabel>
              <SettingsInput value={settings.postalCode} onChange={v => onChange('postalCode', v)} />
            </div>
            <div>
              <SettingsLabel>Country</SettingsLabel>
              <SettingsInput value={settings.country} onChange={v => onChange('country', v)} />
            </div>
          </div>
          <div>
            <SettingsLabel>Timezone</SettingsLabel>
            <SettingsSelect
              value={settings.timezone}
              onChange={v => onChange('timezone', v)}
              options={[
                { value: 'Europe/Belgrade', label: 'Europe/Belgrade (CET)' },
                { value: 'Europe/London', label: 'Europe/London (GMT)' },
                { value: 'Europe/Berlin', label: 'Europe/Berlin (CET)' },
                { value: 'Europe/Istanbul', label: 'Europe/Istanbul (TRT)' },
                { value: 'America/New_York', label: 'America/New York (EST)' },
                { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
              ]}
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
