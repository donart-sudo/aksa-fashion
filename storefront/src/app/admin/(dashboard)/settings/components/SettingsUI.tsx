'use client'

import { type ReactNode } from 'react'

/* ── Card ─────────────────────────────────────────────────────────────── */

export function SettingsCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-6">
      <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1">{title}</h3>
      {description && <p className="text-[13px] text-[#616161] mb-6">{description}</p>}
      {!description && <div className="mb-6" />}
      {children}
    </div>
  )
}

/* ── Label ────────────────────────────────────────────────────────────── */

export function SettingsLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-1.5">
      {children}
    </label>
  )
}

/* ── Input ────────────────────────────────────────────────────────────── */

export function SettingsInput({ value, onChange, type = 'text', placeholder, prefix, hint }: {
  value: string | number
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  prefix?: string
  hint?: string
}) {
  return (
    <div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8a8a8a]">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input w-full ${prefix ? 'pl-7' : ''}`}
        />
      </div>
      {hint && <p className="text-[11px] text-[#b5b5b5] mt-1">{hint}</p>}
    </div>
  )
}

/* ── TextArea ─────────────────────────────────────────────────────────── */

export function SettingsTextArea({ value, onChange, placeholder, rows = 5 }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="input w-full resize-y"
      style={{ minHeight: '80px' }}
    />
  )
}

/* ── Select ───────────────────────────────────────────────────────────── */

export function SettingsSelect({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="input w-full">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

/* ── Toggle Switch ────────────────────────────────────────────────────── */

export function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative w-[44px] h-[24px] rounded-full border-none cursor-pointer shrink-0 transition-colors duration-200"
      style={{ background: checked ? '#047b5d' : '#d1d1d1' }}
    >
      <span
        className="absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform duration-200"
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}

/* ── Toggle Row ───────────────────────────────────────────────────────── */

export function SettingsToggleRow({ label, description, checked, onChange }: {
  label: string
  description?: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-[12px]" style={{ background: '#f9f9f9' }}>
      <div>
        <p className="text-[13px] font-semibold text-[#1a1a1a]">{label}</p>
        {description && <p className="text-[12px] text-[#616161]">{description}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  )
}

/* ── Color Picker ─────────────────────────────────────────────────────── */

export function ColorPicker({ value, onChange, presets }: {
  value: string
  onChange: (v: string) => void
  presets?: { color: string; name: string }[]
}) {
  const defaultPresets = [
    { color: '#2D2D2D', name: 'Charcoal' },
    { color: '#B8926A', name: 'Gold' },
    { color: '#047b5d', name: 'Emerald' },
    { color: '#005bd3', name: 'Ocean' },
    { color: '#8051ff', name: 'Violet' },
    { color: '#e22c38', name: 'Ruby' },
  ]
  const colors = presets || defaultPresets

  return (
    <div className="flex items-center gap-3">
      {colors.map(c => (
        <button
          key={c.color}
          type="button"
          onClick={() => onChange(c.color)}
          className="flex flex-col items-center gap-1.5 transition-transform border-none bg-transparent cursor-pointer"
          style={{ transform: value === c.color ? 'scale(1.1)' : 'scale(1)' }}
        >
          <div
            className="w-9 h-9 rounded-full"
            style={{
              background: c.color,
              border: value === c.color ? '2px solid #1a1a1a' : '2px solid transparent',
              boxShadow: value === c.color ? '0 0 0 2px white, 0 0 0 4px #1a1a1a' : 'none',
            }}
          />
          <span className="text-[10px] text-[#8a8a8a]">{c.name}</span>
        </button>
      ))}
      <div className="flex flex-col items-center gap-1.5 ml-2">
        <label className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-[#d1d1d1] flex items-center justify-center hover:border-[#8a8a8a] transition-colors">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="sr-only"
          />
          <span className="text-[10px] text-[#8a8a8a]">#</span>
        </label>
        <span className="text-[10px] text-[#8a8a8a]">Custom</span>
      </div>
    </div>
  )
}
