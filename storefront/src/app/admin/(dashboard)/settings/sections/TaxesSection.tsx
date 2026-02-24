'use client'

import type { StoreSettingsData } from '../types'
import { SettingsCard, SettingsLabel, SettingsInput, SettingsToggleRow } from '../components/SettingsUI'

export default function TaxesSection({ settings, onChange }: {
  settings: StoreSettingsData
  onChange: <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => void
}) {
  return (
    <SettingsCard title="Taxes" description="Configure tax collection for your store.">
      <div className="space-y-4">
        <SettingsToggleRow
          label="Collect tax"
          description="Auto-calculate tax on orders"
          checked={settings.taxEnabled}
          onChange={() => onChange('taxEnabled', !settings.taxEnabled)}
        />
        {settings.taxEnabled && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SettingsLabel>Tax rate (%)</SettingsLabel>
                <SettingsInput
                  type="number"
                  value={settings.taxRate}
                  onChange={v => onChange('taxRate', Number(v))}
                  hint="Default: 18% (Kosovo VAT)"
                />
              </div>
              <div>
                <SettingsLabel>Tax ID / VAT number</SettingsLabel>
                <SettingsInput
                  value={settings.taxId}
                  onChange={v => onChange('taxId', v)}
                  placeholder="e.g. XK123456789"
                />
              </div>
            </div>
            <SettingsToggleRow
              label="Tax included in prices"
              description="Displayed prices already include tax"
              checked={settings.taxIncludedInPrices}
              onChange={() => onChange('taxIncludedInPrices', !settings.taxIncludedInPrices)}
            />
          </>
        )}
      </div>
    </SettingsCard>
  )
}
