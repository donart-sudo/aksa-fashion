'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth'

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Home' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, demo } = useAdminAuth()

  function isActive(to: string) {
    return to === '/admin' ? pathname === '/admin' : pathname.startsWith(to)
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-nav flex flex-col z-40">
      {/* Store header */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/[0.08]">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white truncate leading-tight">Aksa Fashion</p>
          {demo && <p className="text-[10px] text-warn-surface leading-tight">Demo mode</p>}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto nav-scroll">
        {links.map((lnk) => {
          const active = isActive(lnk.to)
          return (
            <Link
              key={lnk.to}
              href={lnk.to}
              className={`flex items-center gap-2.5 h-8 px-2.5 rounded-lg text-[13px] font-medium mb-0.5 transition-colors ${
                active
                  ? 'bg-nav-item-active text-nav-text-active'
                  : 'text-nav-text hover:bg-nav-item-hover hover:text-nav-text-hover'
              }`}
            >
              <lnk.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2 : 1.75} />
              {lnk.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-2 space-y-0.5">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-2.5 h-8 px-2.5 rounded-lg text-[13px] font-medium transition-colors ${
            isActive('/admin/settings')
              ? 'bg-nav-item-active text-nav-text-active'
              : 'text-nav-text hover:bg-nav-item-hover hover:text-nav-text-hover'
          }`}
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.75} />
          Settings
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 h-8 px-2.5 rounded-lg text-[13px] font-medium text-nav-text hover:bg-nav-item-hover hover:text-nav-text-hover transition-colors w-full"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </aside>
  )
}
