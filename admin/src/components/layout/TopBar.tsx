import { Search, Bell } from 'lucide-react'
import { useState } from 'react'

interface TopBarProps {
  title: string
}

export default function TopBar({ title }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="h-[56px] bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-[15px] font-semibold text-text-primary">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className={`relative transition-all duration-200 ${searchFocused ? 'w-72' : 'w-56'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-[34px] pl-9 pr-3 rounded-lg border border-border bg-surface text-[13px] text-text-primary placeholder:text-text-tertiary hover:border-border-dark transition-colors"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Notifications */}
        <button className="relative w-[34px] h-[34px] rounded-lg border border-border bg-card hover:bg-surface flex items-center justify-center transition-colors">
          <Bell className="w-4 h-4 text-text-secondary" />
          <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red text-white text-[10px] font-bold flex items-center justify-center">3</span>
        </button>

        {/* Avatar */}
        <div className="w-[34px] h-[34px] rounded-full bg-accent flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
          <span className="text-[12px] font-bold text-white">AF</span>
        </div>
      </div>
    </header>
  )
}
