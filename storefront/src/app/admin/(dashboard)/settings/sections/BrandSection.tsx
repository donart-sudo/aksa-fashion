'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import type { StoreSettingsData } from '../types'
import { SettingsCard, SettingsLabel, SettingsInput, ColorPicker } from '../components/SettingsUI'

export default function BrandSection({ settings, onChange }: {
  settings: StoreSettingsData
  onChange: <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleLogoUpload(file: File) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      onChange('logoUrl', url)
    } catch {
      alert('Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      <SettingsCard title="Logo" description="Your store's logo appears in the header and emails.">
        <div className="flex items-start gap-5">
          <div className="w-[100px] h-[100px] rounded-[14px] border-2 border-dashed border-[#e3e3e3] flex items-center justify-center overflow-hidden shrink-0 bg-[#fafafa]">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Upload className="w-6 h-6 text-[#b5b5b5]" />
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]) }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn btn-secondary"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Upload logo'}
            </button>
            {settings.logoUrl && (
              <button
                type="button"
                onClick={() => onChange('logoUrl', '')}
                className="btn btn-secondary ml-2"
                style={{ color: '#e22c38' }}
              >
                <X className="w-4 h-4" /> Remove
              </button>
            )}
            <p className="text-[12px] text-[#8a8a8a]">Recommended: 512x512px, PNG or SVG</p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Colors" description="Brand colors applied to your live storefront. Changes take effect on next page load.">
        <div className="space-y-5">
          <div>
            <SettingsLabel>Primary color</SettingsLabel>
            <ColorPicker
              value={settings.primaryColor}
              onChange={v => onChange('primaryColor', v)}
              presets={[
                { color: '#2D2D2D', name: 'Charcoal' },
                { color: '#1a1a2e', name: 'Navy' },
                { color: '#303030', name: 'Dark' },
                { color: '#0f0f0f', name: 'Black' },
              ]}
            />
          </div>
          <div>
            <SettingsLabel>Accent color</SettingsLabel>
            <ColorPicker
              value={settings.accentColor}
              onChange={v => onChange('accentColor', v)}
              presets={[
                { color: '#B8926A', name: 'Gold' },
                { color: '#C4A882', name: 'Rose' },
                { color: '#047b5d', name: 'Emerald' },
                { color: '#005bd3', name: 'Ocean' },
                { color: '#8051ff', name: 'Violet' },
                { color: '#e22c38', name: 'Ruby' },
              ]}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Social links" description="Connect your social media accounts.">
        <div className="space-y-4">
          <div>
            <SettingsLabel>Instagram</SettingsLabel>
            <SettingsInput value={settings.socialInstagram} onChange={v => onChange('socialInstagram', v)} placeholder="https://instagram.com/yourbrand" />
          </div>
          <div>
            <SettingsLabel>Facebook</SettingsLabel>
            <SettingsInput value={settings.socialFacebook} onChange={v => onChange('socialFacebook', v)} placeholder="https://facebook.com/yourbrand" />
          </div>
          <div>
            <SettingsLabel>TikTok</SettingsLabel>
            <SettingsInput value={settings.socialTiktok} onChange={v => onChange('socialTiktok', v)} placeholder="https://tiktok.com/@yourbrand" />
          </div>
          <div>
            <SettingsLabel>WhatsApp</SettingsLabel>
            <SettingsInput value={settings.socialWhatsapp} onChange={v => onChange('socialWhatsapp', v)} placeholder="+383 44 000 000" />
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
