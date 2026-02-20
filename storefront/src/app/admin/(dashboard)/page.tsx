'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart, Package, Plus, AlertTriangle, Archive, Eye,
} from 'lucide-react'
import Badge from '@/components/admin/Badge'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-supabase'
import { formatCurrency, formatDate, type Order, type Product } from '@/data/adminSampleData'

const sBadge: Record<string, 'success' | 'warning' | 'info' | 'critical' | 'default'> = {
  pending: 'default', processing: 'warning', shipped: 'info', delivered: 'success', cancelled: 'critical',
}

export default function AdminDashboard() {
  const router = useRouter()
  const { demo } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false

    async function load() {
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
          <div className="bg-white rounded-[12px] p-5 border border-[#e3e3e3]"><div className="skeleton h-[120px]" /></div>
        </div>
      </>
    )
  }

  const activeProducts = products.filter(p => p.status === 'active')
  const draftProducts = products.filter(p => p.status === 'draft')
  const totalStock = activeProducts.reduce((s, p) => s + p.inventory, 0)
  const lowStockProducts = activeProducts.filter(p => p.inventory > 0 && p.inventory <= 3)
  const outOfStockProducts = activeProducts.filter(p => p.inventory === 0)
  const recentOrders = orders.slice(0, 5)

  return (
    <>
      <TopBar title="Home" actions={
        <button onClick={() => router.push('/admin/products/new')} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add product
        </button>
      } />
      <div className="p-8 space-y-5">
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

        {/* Recent orders */}
        <div className="bg-white rounded-[12px] border border-[#e3e3e3] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
            <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Recent orders</h3>
            {recentOrders.length > 0 && (
              <Link href="/admin/orders" className="text-[12px] font-medium text-[#005bd3] no-underline hover:underline">
                View all
              </Link>
            )}
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ShoppingCart className="w-9 h-9 text-[#d1d1d1] mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[13px] text-[#8a8a8a]">No orders yet</p>
              <p className="text-[12px] text-[#b5b5b5] mt-0.5">Orders will appear here when customers purchase</p>
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
    </>
  )
}
