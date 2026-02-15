'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Settings, LogOut, ExternalLink, Store, FolderOpen, Layers, Tag, Hash, Box,
} from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth'

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Home' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/collections', icon: FolderOpen, label: 'Collections' },
  { to: '/admin/categories', icon: Layers, label: 'Categories' },
  { to: '/admin/discounts', icon: Tag, label: 'Discounts' },
  { to: '/admin/tags', icon: Hash, label: 'Tags' },
  { to: '/admin/inventory', icon: Box, label: 'Inventory' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, demo, email } = useAdminAuth()

  function isActive(to: string) {
    return to === '/admin' ? pathname === '/admin' : pathname.startsWith(to)
  }

  const initials = email ? email[0].toUpperCase() : 'A'

  return (
    <nav className="w-[240px] shrink-0 bg-white flex flex-col py-3 h-screen sticky top-0 border-r border-[#e3e3e3]">
      {/* Brand */}
      <div className="px-3 mb-3">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="w-[32px] h-[32px] rounded-[10px] bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <Store size={15} className="text-white" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#1a1a1a] truncate leading-tight">Aksa Fashion</p>
            <p className="text-[11px] text-[#8a8a8a] leading-tight">
              {demo ? 'Demo Mode' : 'Luxury Bridal'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col gap-[2px] px-2.5">
        {links.map((lnk) => {
          const active = isActive(lnk.to)
          return (
            <Link
              key={lnk.to}
              href={lnk.to}
              className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-[10px] text-[13px] no-underline transition-all duration-100
                ${active
                  ? 'bg-[#f1f1f1] text-[#1a1a1a] font-semibold'
                  : 'text-[#616161] hover:bg-[#f6f6f6] hover:text-[#1a1a1a] font-medium'
                }`}
            >
              <lnk.icon size={17} strokeWidth={active ? 2.1 : 1.75} />
              {lnk.label}
            </Link>
          )
        })}
      </div>

      {/* Bottom */}
      <div className="px-2.5 flex flex-col gap-[2px] mb-1">
        <a
          href="/en"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-[10px] text-[13px] font-medium text-[#616161] hover:bg-[#f6f6f6] hover:text-[#1a1a1a] no-underline transition-all duration-100"
        >
          <ExternalLink size={17} strokeWidth={1.75} />
          View store
        </a>
        <Link
          href="/admin/settings"
          className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-[10px] text-[13px] no-underline transition-all duration-100
            ${isActive('/admin/settings')
              ? 'bg-[#f1f1f1] text-[#1a1a1a] font-semibold'
              : 'text-[#616161] hover:bg-[#f6f6f6] hover:text-[#1a1a1a] font-medium'
            }`}
        >
          <Settings size={17} strokeWidth={1.75} />
          Settings
        </Link>
      </div>

      {/* User */}
      <div className="px-3 pt-2.5 border-t border-[#ebebeb] mx-2.5">
        <div className="flex items-center gap-2.5 px-0.5">
          <div className="w-[30px] h-[30px] rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{email || 'Admin'}</p>
            <p className="text-[10px] text-[#8a8a8a]">Owner</p>
          </div>
          <button
            onClick={logout}
            className="bg-transparent border-none cursor-pointer text-[#b5b5b5] hover:text-[#1a1a1a] p-1 rounded-[6px] flex transition-colors duration-150"
            title="Log out"
          >
            <LogOut size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </nav>
  )
}
