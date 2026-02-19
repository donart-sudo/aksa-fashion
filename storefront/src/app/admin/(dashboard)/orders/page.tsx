'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, Truck, CheckCircle, XCircle, Eye, Package, Clock, DollarSign, ShoppingCart, ArrowUpRight } from 'lucide-react'
import Badge from '@/components/admin/Badge'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-supabase'
import { formatCurrency, formatDate, type Order, type OrderStatus } from '@/data/adminSampleData'

const tabs: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const sBadge: Record<OrderStatus, 'success' | 'warning' | 'info' | 'critical' | 'default'> = {
  pending: 'default', processing: 'warning', shipped: 'info', delivered: 'success', cancelled: 'critical',
}
const fBadge: Record<string, 'success' | 'warning' | 'critical' | 'default'> = {
  fulfilled: 'success', partially_fulfilled: 'warning', unfulfilled: 'default', returned: 'critical',
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { demo } = useAdminAuth()
  const [list, setList] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkOpen, setBulkOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false

    async function load() {
      // Try admin API for orders (requires auth)
      if (!demo) {
        try {
          const res = await adminMedusa.getOrders({ limit: '50', order: '-created_at' })
          if (cancel) return
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setList(res.orders.map((o: any) => ({
            id: o.id as string,
            orderNumber: `#AKS-${o.display_id}`,
            customer: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : 'Guest',
            customerEmail: o.customer?.email || '',
            items: (o.items || []).map((i: any) => ({ productId: '', name: i.title as string, quantity: i.quantity as number, price: i.unit_price as number })),
            total: o.total as number,
            status: (o.status || 'pending') as OrderStatus,
            fulfillment: (o.fulfillment_status || 'unfulfilled') as Order['fulfillment'],
            paymentMethod: o.payment_status as string,
            createdAt: o.created_at as string,
            shippingAddress: o.shipping_address ? `${o.shipping_address.address_1}, ${o.shipping_address.city}` : '',
          })))
        } catch {
          // Admin API failed — orders stays empty
        }
      }
      if (!cancel) setLoading(false)
    }
    load()
    return () => { cancel = true }
  }, [demo])

  const filtered = useMemo(() => list.filter(o => {
    const ms = filter === 'all' || o.status === filter
    const mq = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase())
    return ms && mq
  }), [list, filter, search])

  const counts = useMemo(() => ({
    all: list.length,
    pending: list.filter(o => o.status === 'pending').length,
    processing: list.filter(o => o.status === 'processing').length,
    shipped: list.filter(o => o.status === 'shipped').length,
    delivered: list.filter(o => o.status === 'delivered').length,
    cancelled: list.filter(o => o.status === 'cancelled').length,
  }), [list])

  const totalRevenue = list.reduce((s, o) => s + (o.status !== 'cancelled' ? o.total : 0), 0)
  const avgOrder = counts.all - counts.cancelled > 0 ? totalRevenue / (counts.all - counts.cancelled) : 0

  function toggleSel(id: string) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }
  function toggleAll() { setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(o => o.id))) }
  function bulkUpdate(s: OrderStatus) {
    setList(prev => prev.map(o => selected.has(o.id) ? { ...o, status: s, fulfillment: s === 'shipped' || s === 'delivered' ? 'fulfilled' as const : o.fulfillment } : o))
    setSelected(new Set()); setBulkOpen(false)
  }

  if (loading) {
    return (
      <>
        <TopBar title="Orders" />
        <div className="p-8">
          <div className="grid grid-cols-4 gap-5 mb-8">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"><div className="skeleton h-[68px]" /></div>)}</div>
          <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-5"><div className="skeleton h-[400px]" /></div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Orders" subtitle={`${counts.all} total orders`} />
      <div className="p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total orders', value: counts.all.toString(), icon: ShoppingCart, color: '#005bd3', bg: '#eaf4ff' },
            { label: 'Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: '#047b5d', bg: '#cdfed4' },
            { label: 'Avg order value', value: formatCurrency(avgOrder), icon: ArrowUpRight, color: '#7c3aed', bg: '#f0ebff' },
            { label: 'Pending', value: counts.pending.toString(), icon: Clock, color: '#b28400', bg: '#fff8db' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-medium text-[#8a8a8a] uppercase tracking-[0.04em]">{kpi.label}</p>
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: kpi.bg }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} strokeWidth={2} />
                </div>
              </div>
              <p className="text-[26px] font-bold text-[#1a1a1a] tracking-[-0.02em] leading-none">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b5b5b5]" />
              <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-[280px] h-[36px] pl-9 pr-3 rounded-[10px] border border-[#e3e3e3] bg-[#f9f9f9] text-[13px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white" />
            </div>
            {selected.size > 0 && (
              <div className="relative">
                <button onClick={() => setBulkOpen(!bulkOpen)} className="btn btn-primary">
                  Actions ({selected.size}) <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {bulkOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] z-20 py-1.5">
                    <button onClick={() => bulkUpdate('shipped')} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#616161] hover:bg-[#f6f6f6] transition-colors"><Truck className="w-3.5 h-3.5" />Mark shipped</button>
                    <button onClick={() => bulkUpdate('delivered')} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#616161] hover:bg-[#f6f6f6] transition-colors"><CheckCircle className="w-3.5 h-3.5" />Mark delivered</button>
                    <div className="h-px bg-[#f0f0f0] my-1" />
                    <button onClick={() => bulkUpdate('cancelled')} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#e22c38] hover:bg-[#fef1f1] transition-colors"><XCircle className="w-3.5 h-3.5" />Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 px-5 border-b border-[#f0f0f0]">
            {tabs.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)}
                className={`px-3 py-3 text-[13px] font-medium border-b-[2px] -mb-px transition-all whitespace-nowrap ${filter === t.value
                  ? 'border-[#1a1a1a] text-[#1a1a1a]'
                  : 'border-transparent text-[#8a8a8a] hover:text-[#303030]'
                }`}>
                {t.label}
                <span className={`ml-1.5 text-[11px] px-[6px] py-[1px] rounded-[5px] font-semibold ${filter === t.value ? 'bg-[#1a1a1a] text-white' : 'bg-[#f1f1f1] text-[#8a8a8a]'}`}>
                  {counts[t.value as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="px-5 py-3 w-[40px]">
                  <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll}
                    className="w-[15px] h-[15px] cursor-pointer accent-[#1a1a1a] rounded" />
                </th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Order</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Customer</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Date</th>
                <th className="text-right text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Total</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Fulfillment</th>
                <th className="w-[48px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}
                  className={`border-b border-[#f6f6f6] last:border-0 transition-colors cursor-pointer ${selected.has(o.id) ? 'bg-[#eaf4ff]/40' : 'hover:bg-[#fafafa]'}`}
                  onClick={() => router.push(`/admin/orders/${o.id}`)}>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSel(o.id)}
                      className="w-[15px] h-[15px] cursor-pointer accent-[#1a1a1a] rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-semibold text-[#005bd3]">{o.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[13px] font-medium text-[#1a1a1a]">{o.customer}</p>
                    <p className="text-[11px] text-[#8a8a8a]">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#616161]">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right text-[13px] font-semibold text-[#1a1a1a] tabular-nums">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3.5"><Badge variant={sBadge[o.status]} dot>{o.status}</Badge></td>
                  <td className="px-4 py-3.5"><Badge variant={fBadge[o.fulfillment] || 'default'}>{o.fulfillment.replace('_', ' ')}</Badge></td>
                  <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => router.push(`/admin/orders/${o.id}`)} className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#303030] hover:bg-[#f1f1f1] transition-colors">
                      <Eye className="w-[15px] h-[15px]" />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Package className="w-10 h-10 text-[#d1d1d1] mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[14px] font-medium text-[#8a8a8a]">No orders found</p>
                    <p className="text-[12px] text-[#b5b5b5] mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  )
}
