'use client'

import { Check } from 'lucide-react'
import type { StoreSettingsData } from '../types'
import { SettingsCard, SettingsLabel, SettingsInput } from '../components/SettingsUI'

const shippingZones = [
  'Kosovo (domestic)',
  'Albania, North Macedonia',
  'Germany, Switzerland, Austria',
  'Rest of Europe',
]

export default function ShippingSection({ settings, onChange }: {
  settings: StoreSettingsData
  onChange: <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => void
}) {
  return (
    <div className="space-y-5">
      <SettingsCard title="Shipping rates" description="Configure your shipping rates and delivery times.">
        <div className="space-y-4">
          <div>
            <SettingsLabel>Free shipping threshold</SettingsLabel>
            <SettingsInput
              type="number"
              value={settings.freeShippingThreshold}
              onChange={v => onChange('freeShippingThreshold', Number(v))}
              prefix="€"
              hint="Minimum order value for free shipping"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SettingsLabel>Standard shipping rate</SettingsLabel>
              <SettingsInput
                type="number"
                value={settings.standardRate}
                onChange={v => onChange('standardRate', Number(v))}
                prefix="€"
              />
            </div>
            <div>
              <SettingsLabel>Standard delivery days</SettingsLabel>
              <SettingsInput
                value={settings.standardDays}
                onChange={v => onChange('standardDays', v)}
                placeholder="3-5"
                hint="e.g. 3-5 business days"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SettingsLabel>Express shipping rate</SettingsLabel>
              <SettingsInput
                type="number"
                value={settings.expressRate}
                onChange={v => onChange('expressRate', Number(v))}
                prefix="€"
              />
            </div>
            <div>
              <SettingsLabel>Express delivery days</SettingsLabel>
              <SettingsInput
                value={settings.expressDays}
                onChange={v => onChange('expressDays', v)}
                placeholder="1-2"
                hint="e.g. 1-2 business days"
              />
            </div>
          </div>
          <div>
            <SettingsLabel>Processing time</SettingsLabel>
            <SettingsInput
              value={settings.processingTime}
              onChange={v => onChange('processingTime', v)}
              placeholder="2-5 business days"
              hint="Time to prepare the order before shipping"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Shipping zones" description="Active delivery regions for your store.">
        <div className="rounded-[12px] overflow-hidden" style={{ background: '#f9f9f9' }}>
          {shippingZones.map((zone, i) => (
            <div
              key={zone}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < shippingZones.length - 1 ? '1px solid #ebebeb' : 'none' }}
            >
              <span className="text-[13px] text-[#1a1a1a]">{zone}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#cdfed4', color: '#014b40' }}>
                <Check className="w-3 h-3" />Active
              </span>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-[#8a8a8a] mt-3">Shipping zone management is configured in the database.</p>
      </SettingsCard>
    </div>
  )
}
