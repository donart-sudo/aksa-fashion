import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, Users, FileText,
  BarChart3, Megaphone, Tag, Globe, Settings, ChevronLeft,
  Sparkles,
} from 'lucide-react'

const mainLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/content', icon: FileText, label: 'Content' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/marketing', icon: Megaphone, label: 'Marketing' },
  { to: '/discounts', icon: Tag, label: 'Discounts' },
]

const bottomLinks = [
  { to: '/online-store', icon: Globe, label: 'Online Store' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const loc = useLocation()

  function isActive(to: string) {
    return to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to)
  }

  const linkClass = (to: string) =>
    `flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''} h-[34px] px-2.5 rounded-lg text-[13px] font-medium mb-0.5 transition-all duration-150 ${
      isActive(to)
        ? 'bg-white/[0.1] text-white'
        : 'text-sidebar-text hover:bg-white/[0.06] hover:text-white'
    }`

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-navy flex flex-col z-40 transition-all duration-200 ${
        collapsed ? 'w-[60px]' : 'w-[220px]'
      }`}
    >
      {/* Store Header */}
      <div className="h-[56px] flex items-center gap-2.5 px-3 border-b border-white/[0.08] shrink-0">
        <div className="w-[32px] h-[32px] rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">Aksa Fashion</p>
            <p className="text-[10px] text-sidebar-text leading-tight">Prishtina, Kosovo</p>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-2 px-1.5 overflow-y-auto">
        {mainLinks.map(lnk => (
          <NavLink key={lnk.to} to={lnk.to} className={linkClass(lnk.to)} title={collapsed ? lnk.label : undefined}>
            <lnk.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive(lnk.to) ? 2 : 1.75} />
            {!collapsed && <span className="truncate">{lnk.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-1.5 pb-2 border-t border-white/[0.08] pt-2">
        {bottomLinks.map(lnk => (
          <NavLink key={lnk.to} to={lnk.to} className={linkClass(lnk.to)} title={collapsed ? lnk.label : undefined}>
            <lnk.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            {!collapsed && <span className="truncate">{lnk.label}</span>}
          </NavLink>
        ))}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-[34px] rounded-lg text-sidebar-text hover:bg-white/[0.06] hover:text-white transition-colors mt-1"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-[18px] h-[18px] transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  )
}
