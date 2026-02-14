'use client'

import { Search } from 'lucide-react'

interface TopBarProps {
  title: string
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-14 bg-card border-b border-edge flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-[15px] font-semibold text-ink">{title}</h1>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="Search"
            className="input w-56 pl-8"
          />
        </div>
      </div>
    </header>
  )
}
