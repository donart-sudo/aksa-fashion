'use client'

import { Search } from 'lucide-react'

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="h-[60px] bg-white/80 backdrop-blur-md border-b border-[#e3e3e3] flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h1 className="text-[18px] font-semibold text-[#1a1a1a] tracking-[-0.01em]">{title}</h1>
        {subtitle && <p className="text-[12px] text-[#8a8a8a] -mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b5b5b5]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-[200px] h-[34px] pl-8 pr-3 rounded-[10px] border border-[#e3e3e3] bg-[#f9f9f9] text-[12px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white"
          />
        </div>
      </div>
    </header>
  )
}
