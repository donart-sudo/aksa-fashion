import { useState, useMemo, useContext } from 'react'
import { Search, ChevronDown, Truck, CheckCircle, XCircle, Eye, Archive, ShoppingCart } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { ToastContext } from '../App'
import { orders as initialOrders, formatCurrency, formatDate, type Order, type OrderStatus } from '../data/sampleData'

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
const payBadge: Record<string, 'success' | 'warning' | 'default'> = {
  Stripe: 'success', 'Bank Transfer': 'warning',
}

export default function Orders() {
  const { addToast } = useContext(ToastContext)
  const [list, setList] = useState<Order[]>(initialOrders)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkOpen, setBulkOpen] = useState(false)
  const [detail, setDetail] = useState<Order | null>(null)

  const filtered = useMemo(() => list.filter(o => {
    const ms = filter === 'all' || o.status === filter
    const mq = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase())
    return ms && mq
  }), [list, filter, search])

  const counts = useMemo(() => ({
    all: list.length, pending: list.filter(o => o.status === 'pending').length,
    processing: list.filter(o => o.status === 'processing').length,
    shipped: list.filter(o => o.status === 'shipped').length,
    delivered: list.filter(o => o.status === 'delivered').length,
    cancelled: list.filter(o => o.status === 'cancelled').length,
  }), [list])

  function toggleSel(id: string) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }
  function toggleAll() { setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(o => o.id))) }

  function bulkUpdate(s: OrderStatus) {
    setList(prev => prev.map(o =>
      selected.has(o.id) ? { ...o, status: s, fulfillment: (s === 'shipped' || s === 'delivered') ? 'fulfilled' as const : o.fulfillment } : o
    ))
    addToast(`${selected.size} orders updated to ${s}`)
    setSelected(new Set()); setBulkOpen(false)
  }

  function bulkArchive() {
    setList(prev => prev.filter(o => !selected.has(o.id)))
    addToast(`${selected.size} orders archived`)
    setSelected(new Set()); setBulkOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] text-text-primary placeholder:text-text-tertiary hover:border-border-dark transition-colors"
          />
        </div>
        {selected.size > 0 && (
          <div className="relative">
            <button onClick={() => setBulkOpen(!bulkOpen)} className="h-[36px] px-4 rounded-lg bg-accent text-white text-[13px] font-medium flex items-center gap-1.5 hover:bg-accent-dark transition-colors">
              Actions ({selected.size}) <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {bulkOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-20 py-1">
                <button onClick={() => bulkUpdate('shipped')} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-surface transition-colors"><Truck className="w-3.5 h-3.5" />Mark shipped</button>
                <button onClick={() => bulkUpdate('delivered')} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-surface transition-colors"><CheckCircle className="w-3.5 h-3.5" />Mark delivered</button>
                <button onClick={bulkArchive} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-surface transition-colors"><Archive className="w-3.5 h-3.5" />Archive</button>
                <button onClick={() => bulkUpdate('cancelled')} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red hover:bg-red-bg transition-colors"><XCircle className="w-3.5 h-3.5" />Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {tabs.map(t => (
          <button key={t.value} onClick={() => setFilter(t.value)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              filter === t.value ? 'border-accent text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}>
            {t.label} <span className="text-text-tertiary ml-1.5 text-[12px]">{counts[t.value as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-5 py-2.5 w-10"><input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} /></th>
                {['Order', 'Customer', 'Date', 'Total', 'Status', 'Fulfillment', 'Payment', ''].map(h => (
                  <th key={h} className={`${h ? 'text-left' : 'text-right'} text-[12px] font-medium text-text-tertiary px-5 py-2.5 whitespace-nowrap`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className={`border-b border-border/50 last:border-0 transition-colors ${selected.has(o.id) ? 'bg-accent/[0.04]' : 'hover:bg-surface/50'}`}>
                  <td className="px-5 py-3"><input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSel(o.id)} /></td>
                  <td className="px-5 py-3 text-[13px] font-medium text-accent">{o.orderNumber}</td>
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-medium text-text-primary">{o.customer}</p>
                    <p className="text-[11px] text-text-tertiary">{o.customerEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-text-secondary">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold text-text-primary">{formatCurrency(o.total)}</td>
                  <td className="px-5 py-3"><Badge variant={sBadge[o.status]}>{o.status}</Badge></td>
                  <td className="px-5 py-3"><Badge variant={fBadge[o.fulfillment]}>{o.fulfillment.replace('_', ' ')}</Badge></td>
                  <td className="px-5 py-3"><Badge variant={payBadge[o.paymentMethod] || 'default'}>{o.paymentMethod}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setDetail(o)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors">
                      <Eye className="w-4 h-4 text-text-secondary" />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={9} className="px-5 py-12 text-center">
                  <ShoppingCart className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
                  <p className="text-[13px] text-text-tertiary">No orders found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Order ${detail?.orderNumber || ''}`} width="max-w-xl">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={sBadge[detail.status]}>{detail.status}</Badge>
              <Badge variant={fBadge[detail.fulfillment]}>{detail.fulfillment.replace('_', ' ')}</Badge>
              <Badge variant={payBadge[detail.paymentMethod] || 'default'}>{detail.paymentMethod}</Badge>
              <span className="text-[12px] text-text-tertiary ml-auto">{formatDate(detail.createdAt)}</span>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border/50">
              <p className="text-[12px] font-medium text-text-tertiary mb-1.5">Customer</p>
              <p className="text-[13px] font-medium text-text-primary">{detail.customer}</p>
              <p className="text-[12px] text-text-secondary">{detail.customerEmail}</p>
              <p className="text-[12px] text-text-secondary mt-1">{detail.shippingAddress}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-text-tertiary mb-2">Items</p>
              {detail.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-surface rounded-lg px-4 py-3 mb-1.5 border border-border/50">
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">{item.name}</p>
                    <p className="text-[11px] text-text-tertiary">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-[13px] font-semibold text-text-primary">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-[14px] font-semibold text-text-primary">Total</span>
              <span className="text-[20px] font-bold text-text-primary">{formatCurrency(detail.total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
