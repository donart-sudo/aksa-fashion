'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DollarSign, ShoppingCart, Users, TrendingUp, Package,
  Plus, AlertTriangle, ChevronRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import Badge from '@/components/admin/Badge'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-medusa'
import { formatCurrency, formatDate, type Order, type Product } from '@/data/adminSampleData'

const channelData = [
  { name: 'Online Store', value: 58, color: '#1a1a1a' },
  { name: 'Instagram', value: 24, color: '#7c3aed' },
  { name: 'Referral', value: 12, color: '#005bd3' },
  { name: 'Direct', value: 6, color: '#d1d1d1' },
]

const sBadge: Record<string, 'success' | 'warning' | 'info' | 'critical' | 'default'> = {
  pending: 'default', processing: 'warning', shipped: 'info', delivered: 'success', cancelled: 'critical',
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] text-white text-[12px] px-3.5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-none">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[#999]">{p.name}: <span className="text-white font-medium">{typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? formatCurrency(p.value) : p.value}</span></p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { demo } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false

    async function load() {
      // Fetch real products from the store API
      try {
        const storeRes = await adminMedusa.getStoreProducts({ limit: '100' })
        if (cancel) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setProducts(storeRes.products.map((p: any) => ({
          id: p.id as string, name: p.title as string,
          sku: p.variants?.[0]?.id?.slice(0, 12) || '',
          price: p.variants?.[0]?.calculated_price?.calculated_amount || 0,
          status: (p.status === 'published' ? 'active' : 'draft') as Product['status'],
          category: p.categories?.[0]?.name || p.collection?.title || 'Uncategorized',
          inventory: (p.variants || []).reduce((s: number, v: any) => s + (v.inventory_quantity || 0), 0),
          image: p.thumbnail || '', description: p.description || '', createdAt: p.created_at as string,
        })))
      } catch { /* Store API failed */ }

      // Fetch orders + customers from admin API
      if (!demo) {
        try {
          const ordersRes = await adminMedusa.getOrders({ limit: '10', order: '-created_at' })
          if (cancel) return
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setOrders(ordersRes.orders.map((o: any) => ({
            id: o.id as string, orderNumber: `#AKS-${o.display_id}`,
            customer: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : 'Guest',
            customerEmail: o.customer?.email || '',
            items: (o.items || []).map((i: any) => ({ productId: '', name: i.title as string, quantity: i.quantity as number, price: i.unit_price as number })),
            total: o.total as number, status: (o.status || 'pending') as Order['status'],
            fulfillment: (o.fulfillment_status || 'unfulfilled') as Order['fulfillment'],
            paymentMethod: o.payment_status as string, createdAt: o.created_at as string,
            shippingAddress: o.shipping_address ? `${o.shipping_address.address_1}, ${o.shipping_address.city}` : '',
          })))
        } catch { /* Admin API failed */ }

        try {
          const custRes = await adminMedusa.getCustomers({ limit: '1' })
          if (cancel) return
          setCustomerCount(custRes.count || 0)
        } catch { /* ignore */ }
      }

      if (!cancel) setLoading(false)
    }
    load()
    return () => { cancel = true }
  }, [demo])

  if (loading) {
    return (
      <>
        <TopBar title="Home" />
        <div className="p-8">
          <div className="grid grid-cols-4 gap-5 mb-8">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"><div className="skeleton h-[80px]" /></div>)}</div>
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"><div className="skeleton h-[280px]" /></div>
        </div>
      </>
    )
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.total : 0), 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0
  const recentOrders = orders.slice(0, 5)
  const topProducts = products.filter(p => p.status === 'active').slice(0, 5)
  const lowStockProducts = products.filter(p => p.status === 'active' && p.inventory > 0 && p.inventory <= 3)
  const outOfStockProducts = products.filter(p => p.status === 'active' && p.inventory === 0)

  // Build revenue chart from actual order data grouped by month
  const revenueByMonth: Record<string, number> = {}
  orders.forEach(o => {
    if (o.status === 'cancelled') return
    const d = new Date(o.createdAt)
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    revenueByMonth[key] = (revenueByMonth[key] || 0) + o.total
  })
  const revenueChartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }))

  return (
    <>
      <TopBar title="Home" subtitle="Dashboard overview" actions={
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/admin/products/new')} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add product
          </button>
        </div>
      } />
      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5">
          {[
            { label: 'Total revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: '#047b5d', bg: '#cdfed4', href: '/admin/orders' },
            { label: 'Orders', value: totalOrders.toString(), icon: ShoppingCart, color: '#005bd3', bg: '#eaf4ff', href: '/admin/orders' },
            { label: 'Products', value: totalProducts.toString(), icon: Package, color: '#1a1a1a', bg: '#f1f1f1', href: '/admin/products' },
            { label: 'Customers', value: customerCount.toString(), icon: Users, color: '#7c3aed', bg: '#f0ebff', href: '/admin/customers' },
          ].map(kpi => (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow no-underline group"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-medium text-[#8a8a8a] uppercase tracking-[0.04em]">{kpi.label}</p>
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: kpi.bg }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-[26px] font-bold text-[#1a1a1a] tracking-[-0.02em] leading-none">{kpi.value}</p>
                <ChevronRight size={16} className="text-[#d1d1d1] group-hover:text-[#8a8a8a] transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Alerts row — low stock / out of stock */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div className="grid grid-cols-2 gap-5">
            {outOfStockProducts.length > 0 && (
              <div className="rounded-[14px] p-4 flex items-start gap-3" style={{ background: '#fee8eb', border: '1px solid #fca5a5' }}>
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#fca5a5' }}>
                  <Package size={16} style={{ color: '#e22c38' }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: '#991b1b' }}>
                    {outOfStockProducts.length} product{outOfStockProducts.length > 1 ? 's' : ''} out of stock
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: '#e22c38' }}>
                    {outOfStockProducts.slice(0, 3).map(p => p.name).join(', ')}
                    {outOfStockProducts.length > 3 ? ` and ${outOfStockProducts.length - 3} more` : ''}
                  </p>
                </div>
                <Link href="/admin/products" className="text-[12px] font-medium shrink-0 no-underline" style={{ color: '#991b1b' }}>
                  View
                </Link>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div className="rounded-[14px] p-4 flex items-start gap-3" style={{ background: '#fff8db', border: '1px solid #fde68a' }}>
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#fde68a' }}>
                  <AlertTriangle size={16} style={{ color: '#b28400' }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: '#78350f' }}>
                    {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} low in stock
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: '#b28400' }}>
                    {lowStockProducts.slice(0, 3).map(p => `${p.name} (${p.inventory} left)`).join(', ')}
                  </p>
                </div>
                <Link href="/admin/products" className="text-[12px] font-medium shrink-0 no-underline" style={{ color: '#78350f' }}>
                  View
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Revenue</h3>
                <p className="text-[12px] text-[#8a8a8a] mt-0.5">
                  {revenueChartData.length > 0 ? 'Based on actual orders' : 'No order data yet'}
                </p>
              </div>
              {totalRevenue > 0 && (
                <p className="text-[18px] font-bold text-[#1a1a1a] tabular-nums">{formatCurrency(totalRevenue)}</p>
              )}
            </div>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a8a8a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8a8a8a' }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v / 100).toLocaleString()}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1a1a1a" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px]">
                <div className="text-center">
                  <DollarSign className="w-10 h-10 text-[#d1d1d1] mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#8a8a8a]">Revenue chart will appear when you have orders</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
            <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Sales channels</h3>
            <p className="text-[12px] text-[#8a8a8a] mb-4">Traffic distribution</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                  {channelData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 mt-2">
              {channelData.map(c => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-[12px] text-[#616161]">{c.name}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-[#1a1a1a]">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Top products */}
          <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
              <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Top products</h3>
              <Link href="/admin/products" className="text-[12px] font-medium text-[#005bd3] no-underline hover:underline">
                View all
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Package className="w-9 h-9 text-[#d1d1d1] mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[13px] text-[#8a8a8a]">No products yet</p>
                <button onClick={() => router.push('/admin/products/new')} className="text-[13px] text-[#005bd3] font-medium mt-1 bg-transparent border-none cursor-pointer hover:underline">
                  Add your first product
                </button>
              </div>
            ) : topProducts.map((p, i) => (
              <div
                key={p.id}
                onClick={() => router.push(`/admin/products/${p.id}`)}
                className="flex items-center gap-3 px-5 py-3 border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-semibold text-[#b5b5b5] w-4">{i + 1}</span>
                {p.image ? (
                  <img src={p.image} alt="" className="w-9 h-9 rounded-[8px] object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-[8px] bg-[#f1f1f1] flex items-center justify-center"><Package size={14} className="text-[#b5b5b5]" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{p.name}</p>
                  <p className="text-[11px] text-[#8a8a8a]">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#1a1a1a] tabular-nums">{formatCurrency(p.price)}</p>
                  <p className={`text-[11px] font-medium ${p.inventory === 0 ? 'text-[#e22c38]' : p.inventory <= 2 ? 'text-[#b28400]' : 'text-[#8a8a8a]'}`}>
                    {p.inventory === 0 ? 'Out of stock' : `${p.inventory} in stock`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
              <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Recent orders</h3>
              <Link href="/admin/orders" className="text-[12px] font-medium text-[#005bd3] no-underline hover:underline">
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <ShoppingCart className="w-9 h-9 text-[#d1d1d1] mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[13px] text-[#8a8a8a]">No orders yet</p>
                <p className="text-[12px] text-[#b5b5b5] mt-1">Orders will appear here when customers make purchases</p>
              </div>
            ) : recentOrders.map(o => (
              <div
                key={o.id}
                onClick={() => router.push(`/admin/orders/${o.id}`)}
                className="flex items-center gap-3 px-5 py-3 border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-[#005bd3]">{o.orderNumber}</p>
                    <Badge variant={sBadge[o.status]} dot>{o.status}</Badge>
                  </div>
                  <p className="text-[12px] text-[#8a8a8a] mt-0.5">{o.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#1a1a1a] tabular-nums">{formatCurrency(o.total)}</p>
                  <p className="text-[11px] text-[#b5b5b5]">{formatDate(o.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-5">
          <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-4">Quick actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Add product', href: '/admin/products/new', icon: Plus, color: '#005bd3', bg: '#eaf4ff' },
              { label: 'View orders', href: '/admin/orders', icon: ShoppingCart, color: '#047b5d', bg: '#ecfdf5' },
              { label: 'Manage discounts', href: '/admin/discounts', icon: DollarSign, color: '#7c3aed', bg: '#f0ebff' },
              { label: 'Store settings', href: '/admin/settings', icon: TrendingUp, color: '#1a1a1a', bg: '#f1f1f1' },
            ].map(action => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-[#fafafa] border border-[#f0f0f0] no-underline transition-colors"
              >
                <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: action.bg }}>
                  <action.icon size={16} style={{ color: action.color }} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-medium text-[#1a1a1a]">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
