'use client'

import type { StoreSettingsData } from '../types'
import { SettingsCard, SettingsLabel, SettingsSelect, ToggleSwitch } from '../components/SettingsUI'

const languages = [
  { code: 'sq', name: 'Albanian', native: 'Shqip', rtl: false },
  { code: 'en', name: 'English', native: 'English', rtl: false },
  { code: 'tr', name: 'Turkish', native: 'Turkce', rtl: false },
  { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
]

export default function LanguagesSection({ settings, onChange }: {
  settings: StoreSettingsData
  onChange: <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => void
}) {
  function toggleLanguage(code: string) {
    const active = settings.activeLanguages || []
    if (code === settings.primaryLanguage) return
    if (active.includes(code)) {
      onChange('activeLanguages', active.filter(c => c !== code))
    } else {
      onChange('activeLanguages', [...active, code])
    }
  }

  return (
    <SettingsCard title="Languages" description="Configure which languages your storefront supports.">
      <div className="space-y-5">
        <div>
          <SettingsLabel>Primary language</SettingsLabel>
          <SettingsSelect
            value={settings.primaryLanguage}
            onChange={v => onChange('primaryLanguage', v)}
            options={languages.map(l => ({ value: l.code, label: `${l.name} (${l.native})` }))}
          />
          <p className="text-[12px] text-[#8a8a8a] mt-1.5">The default language for your storefront.</p>
        </div>

        <div>
          <SettingsLabel>Active languages</SettingsLabel>
          <div className="space-y-2">
            {languages.map(lang => {
              const isPrimary = lang.code === settings.primaryLanguage
              const isActive = settings.activeLanguages?.includes(lang.code) || isPrimary
              return (
                <div
                  key={lang.code}
                  className="flex items-center justify-between py-3 px-4 rounded-[12px]"
                  style={{ background: '#f9f9f9' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">{lang.name}</span>
                    <span className="text-[12px] text-[#8a8a8a]">{lang.native}</span>
                    {isPrimary && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#eaf4ff', color: '#005bd3' }}>
                        Primary
                      </span>
                    )}
                    {lang.rtl && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                        RTL
                      </span>
                    )}
                  </div>
                  <ToggleSwitch
                    checked={isActive}
                    onChange={() => toggleLanguage(lang.code)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </SettingsCard>
  )
}
