'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart, Package, Plus, AlertTriangle, Archive, Eye,
  DollarSign, Clock, CreditCard, Truck, CheckCircle,
} from 'lucide-react'
import Badge from '@/components/admin/Badge'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-supabase'
import { formatCurrency, formatDate, type Order, type Product } from '@/data/adminSampleData'

const sBadge: Record<string, 'success' | 'warning' | 'info' | 'critical' | 'default'> = {
  pending: 'default', processing: 'warning', shipped: 'info', delivered: 'success', completed: 'success', cancelled: 'critical',
}
const pBadge: Record<string, 'success' | 'warning' | 'critical' | 'default'> = {
  captured: 'success', awaiting: 'warning', not_paid: 'warning',
}
const pLabel: Record<string, string> = {
  captured: 'Paid', awaiting: 'Unpaid', not_paid: 'Unpaid',
}

const PER_PAGE = 10

export default function AdminDashboard() {
  const router = useRouter()
  const { demo } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancel = false

    async function load() {
      try {
        const storeRes = await adminMedusa.getStoreProducts({ limit: '1000' })
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

      if (!demo) {
        try {
          const ordersRes = await adminMedusa.getOrders({ limit: '1000', order: '-created_at' })
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
      }

      if (!cancel) setLoading(false)
    }
    load()
    return () => { cancel = true }
  }, [demo])

  const activeProducts = useMemo(() => products.filter(p => p.status === 'active'), [products])
  const draftProducts = useMemo(() => products.filter(p => p.status === 'draft'), [products])
  const totalStock = useMemo(() => activeProducts.reduce((s, p) => s + p.inventory, 0), [activeProducts])
  const lowStockProducts = useMemo(() => activeProducts.filter(p => p.inventory > 0 && p.inventory <= 3), [activeProducts])
  const outOfStockProducts = useMemo(() => activeProducts.filter(p => p.inventory === 0), [activeProducts])

  // Order metrics
  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.total : 0), 0), [orders])
  const awaitingPayment = useMemo(() => orders.filter(o => (o.paymentMethod === 'awaiting' || o.paymentMethod === 'not_paid') && o.status !== 'cancelled').length, [orders])
  const needsFulfillment = useMemo(() => orders.filter(o => o.fulfillment === 'unfulfilled' && o.status !== 'cancelled' && o.status !== 'completed' && o.status !== 'delivered').length, [orders])
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'completed' || o.status === 'delivered').length, [orders])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(orders.length / PER_PAGE))
  const paginatedOrders = useMemo(() => orders.slice((page - 1) * PER_PAGE, page * PER_PAGE), [orders, page])

  if (loading) {
    return (
      <>
        <TopBar title="Home" />
        <div className="p-8">
          <div className="grid grid-cols-4 gap-5 mb-5">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"><div className="skeleton h-[68px]" /></div>)}</div>
          <div className="bg-white rounded-[12px] p-5 border border-[#e3e3e3]"><div className="skeleton h-[120px]" /></div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Home" actions={
        <button onClick={() => router.push('/admin/products/new')} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add product
        </button>
      } />
      <div className="p-8 space-y-5">
        {/* Revenue KPIs — clickable */}
        <div className="grid grid-cols-4 gap-5">
          {[
            { label: 'Total revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: '#047b5d', bg: '#cdfed4', href: '/admin/orders' },
            { label: 'Total orders', value: orders.length.toString(), icon: ShoppingCart, color: '#005bd3', bg: '#eaf4ff', href: '/admin/orders' },
            { label: 'Awaiting payment', value: awaitingPayment.toString(), icon: CreditCard, color: '#b28400', bg: '#fff8db', href: '/admin/orders?filter=unpaid' },
            { label: 'To fulfill', value: needsFulfillment.toString(), icon: Truck, color: '#7c3aed', bg: '#f0ebff', href: '/admin/orders?filter=unfulfilled' },
          ].map(kpi => (
            <Link key={kpi.label} href={kpi.href} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] no-underline hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-medium text-[#8a8a8a] uppercase tracking-[0.04em]">{kpi.label}</p>
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: kpi.bg }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} strokeWidth={2} />
                </div>
              </div>
              <p className="text-[26px] font-bold text-[#1a1a1a] tracking-[-0.02em] leading-none">{kpi.value}</p>
            </Link>
          ))}
        </div>

        {/* Order status summary */}
        <div className="bg-white rounded-[12px] border border-[#e3e3e3] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
            <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Order overview</h3>
          </div>
          <div className="grid grid-cols-5 divide-x divide-[#f0f0f0]">
            {[
              { label: 'Open', count: orders.filter(o => o.status === 'pending' || o.status === 'processing').length, icon: Clock, color: '#8a8a8a' },
              { label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length, icon: Truck, color: '#005bd3' },
              { label: 'Completed', count: completedOrders, icon: CheckCircle, color: '#047b5d' },
              { label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, icon: AlertTriangle, color: '#e22c38' },
              { label: 'Paid', count: orders.filter(o => o.paymentMethod === 'captured').length, icon: CreditCard, color: '#047b5d' },
            ].map(s => (
              <Link key={s.label} href="/admin/orders" className="px-5 py-4 no-underline hover:bg-[#fafafa] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={14} style={{ color: s.color }} />
                  <span className="text-[12px] font-medium text-[#8a8a8a]">{s.label}</span>
                </div>
                <p className="text-[22px] font-bold text-[#1a1a1a] leading-none">{s.count}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Inventory snapshot */}
        <div className="bg-white rounded-[12px] border border-[#e3e3e3] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
            <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Inventory</h3>
          </div>
          <div className="grid grid-cols-4 divide-x divide-[#f0f0f0]">
            <Link href="/admin/products" className="px-5 py-4 no-underline hover:bg-[#fafafa] transition-colors">
              <div className="flex items-center gap-2.5 mb-2">
                <Eye size={14} className="text-[#047b5d]" />
                <span className="text-[12px] font-medium text-[#8a8a8a]">Active</span>
              </div>
              <p className="text-[22px] font-bold text-[#1a1a1a] leading-none">{activeProducts.length}</p>
            </Link>
            <Link href="/admin/products" className="px-5 py-4 no-underline hover:bg-[#fafafa] transition-colors">
              <div className="flex items-center gap-2.5 mb-2">
                <Archive size={14} className="text-[#8a8a8a]" />
                <span className="text-[12px] font-medium text-[#8a8a8a]">Draft</span>
              </div>
              <p className="text-[22px] font-bold text-[#1a1a1a] leading-none">{draftProducts.length}</p>
            </Link>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2.5 mb-2">
                <Package size={14} className="text-[#005bd3]" />
                <span className="text-[12px] font-medium text-[#8a8a8a]">Total stock</span>
              </div>
              <p className="text-[22px] font-bold text-[#1a1a1a] leading-none">{totalStock.toLocaleString()}</p>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2.5 mb-2">
                <AlertTriangle size={14} className={outOfStockProducts.length > 0 ? 'text-[#e22c38]' : 'text-[#8a8a8a]'} />
                <span className="text-[12px] font-medium text-[#8a8a8a]">Out of stock</span>
              </div>
              <p className={`text-[22px] font-bold leading-none ${outOfStockProducts.length > 0 ? 'text-[#e22c38]' : 'text-[#1a1a1a]'}`}>{outOfStockProducts.length}</p>
            </div>
          </div>
        </div>

        {/* Stock alerts */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div className="space-y-3">
            {outOfStockProducts.length > 0 && (
              <div className="rounded-[12px] p-4 flex items-start gap-3 bg-[#fef2f2] border border-[#fca5a5]">
                <div className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center shrink-0 bg-[#fca5a5]">
                  <Package size={15} className="text-[#e22c38]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#991b1b]">
                    {outOfStockProducts.length} product{outOfStockProducts.length > 1 ? 's' : ''} out of stock
                  </p>
                  <p className="text-[12px] mt-0.5 text-[#dc2626]">
                    {outOfStockProducts.slice(0, 3).map(p => p.name).join(', ')}
                    {outOfStockProducts.length > 3 ? ` and ${outOfStockProducts.length - 3} more` : ''}
                  </p>
                </div>
                <Link
                  href={outOfStockProducts.length === 1 ? `/admin/products/${outOfStockProducts[0].id}` : '/admin/products'}
                  className="h-[30px] px-3 rounded-[8px] text-[12px] font-medium shrink-0 no-underline inline-flex items-center bg-white border border-[#fca5a5] text-[#991b1b] hover:bg-[#fff5f5] transition-colors"
                >View</Link>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div className="rounded-[12px] p-4 flex items-start gap-3 bg-[#fffbeb] border border-[#fde68a]">
                <div className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center shrink-0 bg-[#fde68a]">
                  <AlertTriangle size={15} className="text-[#b28400]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#78350f]">
                    {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} low in stock
                  </p>
                  <p className="text-[12px] mt-0.5 text-[#b28400]">
                    {lowStockProducts.slice(0, 3).map(p => `${p.name} (${p.inventory} left)`).join(', ')}
                  </p>
                </div>
                <Link
                  href={lowStockProducts.length === 1 ? `/admin/products/${lowStockProducts[0].id}` : '/admin/products'}
                  className="h-[30px] px-3 rounded-[8px] text-[12px] font-medium shrink-0 no-underline inline-flex items-center bg-white border border-[#fde68a] text-[#78350f] hover:bg-[#fffdf5] transition-colors"
                >View</Link>
              </div>
            )}
          </div>
        )}

        {/* All orders — paginated */}
        <div className="bg-white rounded-[12px] border border-[#e3e3e3] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
            <h3 className="text-[14px] font-semibold text-[#1a1a1a]">All orders</h3>
            {orders.length > 0 && (
              <Link href="/admin/orders" className="text-[12px] font-medium text-[#005bd3] no-underline hover:underline">
                Manage orders
              </Link>
            )}
          </div>
          {orders.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ShoppingCart className="w-9 h-9 text-[#d1d1d1] mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[13px] text-[#8a8a8a]">No orders yet</p>
              <p className="text-[12px] text-[#b5b5b5] mt-0.5">Orders will appear here when customers purchase</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-5 py-2.5">Order</th>
                    <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-2.5">Customer</th>
                    <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-2.5">Status</th>
                    <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-2.5">Payment</th>
                    <th className="text-right text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-5 py-2.5">Total</th>
                    <th className="text-right text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-5 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map(o => (
                    <tr
                      key={o.id}
                      onClick={() => router.push(`/admin/orders/${o.id}`)}
                      className="border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <span className="text-[13px] font-semibold text-[#005bd3]">{o.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-medium text-[#1a1a1a]">{o.customer}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={sBadge[o.status] || 'default'} dot>{o.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={pBadge[o.paymentMethod] || 'warning'}>{pLabel[o.paymentMethod] || 'Unpaid'}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-[13px] font-semibold text-[#1a1a1a] tabular-nums">{formatCurrency(o.total)}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-[11px] text-[#b5b5b5]">{formatDate(o.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {orders.length > PER_PAGE && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0]">
                  <p className="text-[12px] text-[#8a8a8a]">
                    Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, orders.length)} of {orders.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-[30px] px-3 rounded-[8px] text-[12px] font-medium border border-[#e3e3e3] text-[#616161] hover:bg-[#f6f6f6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >Previous</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push('dots')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, i) =>
                        p === 'dots' ? (
                          <span key={`d${i}`} className="px-1 text-[12px] text-[#b5b5b5]">...</span>
                        ) : (
                          <button key={p} onClick={() => setPage(p)}
                            className={`w-[30px] h-[30px] rounded-[8px] text-[12px] font-medium transition-colors ${page === p ? 'bg-[#1a1a1a] text-white' : 'text-[#616161] hover:bg-[#f6f6f6]'}`}
                          >{p}</button>
                        )
                      )}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-[30px] px-3 rounded-[8px] text-[12px] font-medium border border-[#e3e3e3] text-[#616161] hover:bg-[#f6f6f6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
