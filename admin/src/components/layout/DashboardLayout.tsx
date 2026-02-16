import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const titles: Record<string, string> = {
  '/': 'Home',
  '/orders': 'Orders',
  '/products': 'Products',
  '/customers': 'Customers',
  '/content': 'Content',
  '/analytics': 'Analytics',
  '/marketing': 'Marketing',
  '/discounts': 'Discounts',
  '/online-store': 'Online Store',
  '/settings': 'Settings',
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Home'

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`transition-all duration-200 ${collapsed ? 'ml-[60px]' : 'ml-[220px]'}`}>
        <TopBar title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
