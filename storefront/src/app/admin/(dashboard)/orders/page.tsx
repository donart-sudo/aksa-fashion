'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Truck, CheckCircle, XCircle, Eye } from 'lucide-react'
import Badge from '@/components/admin/Badge'
import Modal from '@/components/admin/Modal'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-medusa'
import { orders as demoOrders, formatCurrency, formatDate, type Order, type OrderStatus } from '@/data/adminSampleData'

const tabs: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' }, { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' }, { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' }, { label: 'Cancelled', value: 'cancelled' },
]

const sBadge: Record<OrderStatus, 'success' | 'warning' | 'info' | 'critical' | 'default'> = {
  pending: 'default', processing: 'warning', shipped: 'info', delivered: 'success', cancelled: 'critical',
}
const fBadge: Record<string, 'success' | 'warning' | 'critical' | 'default'> = {
  fulfilled: 'success', partially_fulfilled: 'warning', unfulfilled: 'default', returned: 'critical',
}

export default function AdminOrdersPage() {
  const { demo } = useAdminAuth()
  const [list, setList] = useState<Order[]>(demoOrders)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkOpen, setBulkOpen] = useState(false)
  const [detail, setDetail] = useState<Order | null>(null)
  const [loading, setLoading] = useState(!demo)

  useEffect(() => {
    if (demo) return
    let cancel = false
    adminMedusa.getOrders({ limit: '50', order: '-created_at' }).then(res => {
      if (cancel) return
      setList(res.orders.map(o => ({
        id: o.id, orderNumber: `#AKS-${o.display_id}`,
        customer: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : 'Guest',
        customerEmail: o.customer?.email || '',
        items: o.items.map(i => ({ productId: '', name: i.title, quantity: i.quantity, price: i.unit_price })),
        total: o.total, status: o.status as OrderStatus, fulfillment: o.fulfillment_status as Order['fulfillment'],
        paymentMethod: o.payment_status, createdAt: o.created_at,
        shippingAddress: o.shipping_address ? `${o.shipping_address.address_1}, ${o.shipping_address.city}` : '',
      })))
    }).catch(() => {}).finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [demo])

  const filtered = useMemo(() => list.filter(o => {
    const ms = filter === 'all' || o.status === filter
    const mq = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase())
    return ms && mq
  }), [list, filter, search])

  const counts = useMemo(() => ({
    all: list.length, pending: list.filter(o => o.status === 'pending').length,
    processing: list.filter(o => o.status === 'processing').length, shipped: list.filter(o => o.status === 'shipped').length,
    delivered: list.filter(o => o.status === 'delivered').length, cancelled: list.filter(o => o.status === 'cancelled').length,
  }), [list])

  function toggleSel(id: string) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }
  function toggleAll() { setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(o => o.id))) }
  function bulkUpdate(s: OrderStatus) {
    setList(prev => prev.map(o => selected.has(o.id) ? { ...o, status: s, fulfillment: s === 'shipped' || s === 'delivered' ? 'fulfilled' as const : o.fulfillment } : o))
    setSelected(new Set()); setBulkOpen(false)
  }

  if (loading) return <><TopBar title="Orders" /><div className="p-6"><div className="card p-5"><div className="skeleton h-[400px]" /></div></div></>

  return (
    <>
      <TopBar title="Orders" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <input type="text" placeholder="Search orders" value={search} onChange={e => setSearch(e.target.value)} className="input w-full pl-8" />
          </div>
          {selected.size > 0 && (
            <div className="relative">
              <button onClick={() => setBulkOpen(!bulkOpen)} className="btn btn-primary">
                Actions ({selected.size}) <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {bulkOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 card shadow-lg z-20 py-1">
                  <button onClick={() => bulkUpdate('shipped')} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-ink-light hover:bg-card-hover"><Truck className="w-3.5 h-3.5" />Mark shipped</button>
                  <button onClick={() => bulkUpdate('delivered')} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-ink-light hover:bg-card-hover"><CheckCircle className="w-3.5 h-3.5" />Mark delivered</button>
                  <button onClick={() => bulkUpdate('cancelled')} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-crit hover:bg-crit-surface"><XCircle className="w-3.5 h-3.5" />Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-0 border-b border-edge overflow-x-auto">
          {tabs.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              className={`px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${filter === t.value ? 'border-ink text-ink' : 'border-transparent text-ink-light hover:text-ink'}`}>
              {t.label} <span className="text-ink-faint ml-1">{counts[t.value as keyof typeof counts]}</span>
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge bg-card-hover">
                <th className="px-5 py-2.5 w-10"><input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} /></th>
                {['Order','Customer','Date','Total','Status','Fulfillment',''].map(h => (
                  <th key={h} className={`text-${h ? 'left' : 'right'} text-[12px] font-medium text-ink-faint px-5 py-2.5`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className={`border-b border-edge-light last:border-0 transition-colors ${selected.has(o.id) ? 'bg-card-selected' : 'hover:bg-card-hover'}`}>
                  <td className="px-5 py-2.5"><input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSel(o.id)} /></td>
                  <td className="px-5 py-2.5 text-[13px] font-medium text-note">{o.orderNumber}</td>
                  <td className="px-5 py-2.5"><p className="text-[13px] text-ink">{o.customer}</p><p className="text-[11px] text-ink-faint">{o.customerEmail}</p></td>
                  <td className="px-5 py-2.5 text-[13px] text-ink-light">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-2.5 text-[13px] font-medium text-ink">{formatCurrency(o.total)}</td>
                  <td className="px-5 py-2.5"><Badge variant={sBadge[o.status]}>{o.status}</Badge></td>
                  <td className="px-5 py-2.5"><Badge variant={fBadge[o.fulfillment]}>{o.fulfillment.replace('_', ' ')}</Badge></td>
                  <td className="px-5 py-2.5 text-right">
                    <button onClick={() => setDetail(o)} className="btn-plain w-8 h-8 !p-0 rounded-lg"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-ink-faint">No orders found</td></tr>}
            </tbody>
          </table>
        </div>

        <Modal open={!!detail} onClose={() => setDetail(null)} title={`Order ${detail?.orderNumber || ''}`} width="max-w-xl">
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={sBadge[detail.status]}>{detail.status}</Badge>
                <Badge variant={fBadge[detail.fulfillment]}>{detail.fulfillment.replace('_',' ')}</Badge>
                <span className="text-[12px] text-ink-faint ml-auto">{formatDate(detail.createdAt)}</span>
              </div>
              <div className="bg-card-hover rounded-lg p-4">
                <p className="text-[12px] font-medium text-ink-faint mb-1.5">Customer</p>
                <p className="text-[13px] font-medium text-ink">{detail.customer}</p>
                <p className="text-[12px] text-ink-light">{detail.customerEmail}</p>
                <p className="text-[12px] text-ink-light mt-1">{detail.shippingAddress}</p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-ink-faint mb-2">Items</p>
                {detail.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-card-hover rounded-lg px-4 py-2.5 mb-1">
                    <div><p className="text-[13px] font-medium text-ink">{item.name}</p><p className="text-[11px] text-ink-faint">Qty: {item.quantity}</p></div>
                    <span className="text-[13px] font-medium text-ink">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-edge">
                <span className="text-[14px] font-semibold text-ink">Total</span>
                <span className="text-[18px] font-bold text-ink">{formatCurrency(detail.total)}</span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  )
}
