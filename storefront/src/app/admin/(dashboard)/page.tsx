'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import Link from 'next/link'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-medusa'
import MetricCard from '@/components/admin/MetricCard'
import Badge from '@/components/admin/Badge'
import TopBar from '@/components/admin/TopBar'
import {
  dashboardMetrics, revenueData, categorySales, orders as demoOrders,
  products as demoProducts, formatCurrency, formatDate,
  type Order, type Product,
} from '@/data/adminSampleData'

const statusBadge: Record<string, 'success' | 'warning' | 'info' | 'critical' | 'default'> = {
  delivered: 'success', shipped: 'info', processing: 'warning',
  pending: 'default', cancelled: 'critical',
}

export default function AdminDashboardPage() {
  const { demo } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>(demoOrders)
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [loading, setLoading] = useState(!demo)

  useEffect(() => {
    if (demo) return
    let cancel = false
    async function load() {
      try {
        const [ordRes, prodRes] = await Promise.all([
          adminMedusa.getOrders({ limit: '10', order: '-created_at' }),
          adminMedusa.getProducts({ limit: '10' }),
        ])
        if (cancel) return
        setOrders(ordRes.orders.map((o) => ({
          id: o.id,
          orderNumber: `#AKS-${o.display_id}`,
          customer: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : 'Guest',
          customerEmail: o.customer?.email || '',
          items: o.items.map((i) => ({ productId: '', name: i.title, quantity: i.quantity, price: i.unit_price })),
          total: o.total,
          status: o.status as Order['status'],
          fulfillment: o.fulfillment_status as Order['fulfillment'],
          paymentMethod: o.payment_status,
          createdAt: o.created_at,
          shippingAddress: o.shipping_address ? `${o.shipping_address.address_1}, ${o.shipping_address.city}` : '',
        })))
        setProducts(prodRes.products.map((p) => ({
          id: p.id,
          name: p.title,
          sku: p.variants[0]?.id?.slice(0, 12) || '',
          price: p.variants[0]?.prices[0]?.amount || 0,
          status: p.status === 'published' ? 'active' as const : 'draft' as const,
          category: p.categories[0]?.name || p.collection?.title || 'Uncategorized',
          inventory: p.variants.reduce((s, v) => s + (v.inventory_quantity || 0), 0),
          image: p.thumbnail || '',
          description: p.description || '',
          createdAt: p.created_at,
        })))
      } catch {
        // Fallback to demo data silently
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [demo])

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const topProducts = products.filter((p) => p.status === 'active').slice(0, 5)

  if (loading) {
    return (
      <>
        <TopBar title="Home" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="card p-4"><div className="skeleton h-4 w-24 mb-3" /><div className="skeleton h-7 w-32" /></div>)}
          </div>
          <div className="card p-5"><div className="skeleton h-[280px] w-full" /></div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Home" />
      <div className="p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardMetrics.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} change={m.change} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[14px] font-semibold text-ink">Total sales</h3>
              <span className="text-[12px] text-ink-faint">Last 12 months</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#303030" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#303030" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8c9196' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8c9196' }} axisLine={false} tickLine={false} tickFormatter={(v) => `\u20AC${(v / 100).toLocaleString()}`} />
                <Tooltip contentStyle={{ background: '#303030', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 12px' }} formatter={(v) => [formatCurrency(Number(v)), 'Revenue']} labelStyle={{ color: '#aaa', marginBottom: 2 }} />
                <Area type="monotone" dataKey="revenue" stroke="#303030" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category */}
          <div className="card p-5">
            <h3 className="text-[14px] font-semibold text-ink mb-4">Sales by category</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categorySales} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {categorySales.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#303030', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 12px' }} formatter={(v) => [`${v}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {categorySales.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.fill }} />
                    <span className="text-ink-light">{c.name}</span>
                  </div>
                  <span className="font-medium text-ink">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent orders */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge">
              <h3 className="text-[14px] font-semibold text-ink">Recent orders</h3>
              <Link href="/admin/orders" className="text-[13px] text-note font-medium flex items-center gap-0.5 hover:underline">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-edge-light">
                  {['Order','Customer','Date','Total','Status'].map(h => (
                    <th key={h} className="text-left text-[12px] font-medium text-ink-faint px-5 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-edge-light last:border-0 hover:bg-card-hover transition-colors">
                    <td className="px-5 py-2.5 text-[13px] font-medium text-note">{o.orderNumber}</td>
                    <td className="px-5 py-2.5 text-[13px] text-ink">{o.customer}</td>
                    <td className="px-5 py-2.5 text-[13px] text-ink-light">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-2.5 text-[13px] font-medium text-ink">{formatCurrency(o.total)}</td>
                    <td className="px-5 py-2.5"><Badge variant={statusBadge[o.status]}>{o.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top products */}
          <div className="card">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge">
              <h3 className="text-[14px] font-semibold text-ink">Top products</h3>
              <Link href="/admin/products" className="text-[13px] text-note font-medium flex items-center gap-0.5 hover:underline">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-edge-light last:border-0 hover:bg-card-hover transition-colors">
                <span className="text-[12px] font-medium text-ink-faint w-4">{i + 1}</span>
                {p.image && <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">{p.name}</p>
                  <p className="text-[11px] text-ink-faint">{p.category}</p>
                </div>
                <span className="text-[13px] font-medium text-ink">{formatCurrency(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
