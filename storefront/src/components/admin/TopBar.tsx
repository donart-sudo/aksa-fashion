'use client'

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="h-[52px] bg-white border-b border-[#e3e3e3] flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h1 className="text-[16px] font-semibold text-[#1a1a1a] tracking-[-0.01em]">{title}</h1>
        {subtitle && <p className="text-[12px] text-[#8a8a8a] -mt-0.5">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5">
          {actions}
        </div>
      )}
    </header>
  )
}
