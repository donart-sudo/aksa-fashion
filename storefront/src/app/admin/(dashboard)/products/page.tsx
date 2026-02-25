'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Archive, Package, FileText } from 'lucide-react'
import Badge from '@/components/admin/Badge'
import Modal from '@/components/admin/Modal'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-supabase'
import {
  products as demoProducts, formatCurrency, type Product, type ProductStatus,
} from '@/data/adminSampleData'

const tabs: { label: string; value: ProductStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

const badgeMap: Record<ProductStatus, 'success' | 'warning' | 'default'> = {
  active: 'success', draft: 'warning', archived: 'default',
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { demo } = useAdminAuth()
  const [list, setList] = useState<Product[]>([])
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [delId, setDelId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [menuUp, setMenuUp] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const perPage = 25

  const toggleMenu = useCallback((id: string, e: React.MouseEvent) => {
    if (menuId === id) { setMenuId(null); return }
    const btn = e.currentTarget as HTMLElement
    const rect = btn.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    setMenuUp(spaceBelow < 180)
    setMenuId(id)
  }, [menuId])

  useEffect(() => {
    let cancel = false

    async function load() {
      try {
        const storeRes = await adminMedusa.getStoreProducts({ limit: '1000' })
        if (cancel) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setList(storeRes.products.map((p: any) => ({
          id: p.id as string,
          name: p.title as string,
          sku: p.variants?.[0]?.id?.slice(0, 12) || '',
          price: p.variants?.[0]?.calculated_price?.calculated_amount || 0,
          status: 'active' as const,
          category: p.categories?.[0]?.name || p.collection?.title || 'Uncategorized',
          inventory: (p.variants || []).reduce((s: number, v: any) => s + (v.inventory_quantity || 0), 0),
          image: p.thumbnail || '',
          description: p.description || '',
          createdAt: p.created_at as string,
        })))
      } catch {
        if (!demo) {
          try {
            const res = await adminMedusa.getProducts({ limit: '1000' })
            if (cancel) return
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setList(res.products.map((p: any) => ({
              id: p.id as string,
              name: p.title as string,
              sku: p.variants?.[0]?.id?.slice(0, 12) || '',
              price: p.variants?.[0]?.prices?.[0]?.amount || 0,
              status: p.status === 'published' ? 'active' as const : p.status === 'draft' ? 'draft' as const : 'archived' as const,
              category: p.categories?.[0]?.name || 'Uncategorized',
              inventory: (p.variants || []).reduce((s: number, v: any) => s + (v.inventory_quantity || 0), 0),
              image: p.thumbnail || '',
              description: p.description || '',
              createdAt: p.created_at as string,
            })))
          } catch {
            if (!cancel) setList(demoProducts)
          }
        } else {
          if (!cancel) setList(demoProducts)
        }
      }
      if (!cancel) setLoading(false)
    }
    load()
    return () => { cancel = true }
  }, [demo])

  // Close menu on outside click
  useEffect(() => {
    if (!menuId) return
    const handler = () => setMenuId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [menuId])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [filter, search])

  const filtered = useMemo(() => list.filter(p => {
    const ms = filter === 'all' || p.status === filter
    const mq = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    return ms && mq
  }), [list, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const counts = useMemo(() => ({
    all: list.length,
    active: list.filter(p => p.status === 'active').length,
    draft: list.filter(p => p.status === 'draft').length,
    archived: list.filter(p => p.status === 'archived').length,
  }), [list])

  async function del(id: string) {
    if (!demo) { try { await adminMedusa.deleteProduct(id) } catch {} }
    setList(prev => prev.filter(p => p.id !== id))
    setDelId(null)
  }

  if (loading) {
    return (
      <>
        <TopBar title="Products" />
        <div className="p-8">
          <div className="bg-white rounded-[12px] p-5 border border-[#e3e3e3]"><div className="skeleton h-[400px]" /></div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Products" subtitle={`${counts.all} total`} actions={
        <button onClick={() => router.push('/admin/products/new')} className="btn btn-primary"><Plus className="w-4 h-4" />Add product</button>
      } />
      <div className="p-8">
        {/* Main card */}
        <div className="bg-white rounded-[12px] border border-[#e3e3e3] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b5b5b5]" />
              <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-[280px] h-[34px] pl-9 pr-3 rounded-[8px] border border-[#e3e3e3] bg-[#f9f9f9] text-[13px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 px-5 border-b border-[#f0f0f0]">
            {tabs.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)}
                className={`px-3 py-2.5 text-[13px] font-medium border-b-[2px] -mb-px transition-all whitespace-nowrap ${filter === t.value
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
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-5 py-2.5">Product</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-2.5">Status</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-2.5">Category</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-2.5">Inventory</th>
                <th className="text-right text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-2.5">Price</th>
                <th className="w-[44px]"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} className="border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors group cursor-pointer" onClick={() => router.push(`/admin/products/${p.id}`)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt="" className="w-10 h-10 rounded-[8px] object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-[8px] bg-[#f1f1f1] flex items-center justify-center shrink-0">
                          <Package size={16} className="text-[#b5b5b5]" />
                        </div>
                      )}
                      <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={badgeMap[p.status]} dot>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-[13px] text-[#616161]">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[13px] font-medium ${p.inventory === 0 ? 'text-[#e22c38]' : p.inventory <= 2 ? 'text-[#b28400]' : 'text-[#1a1a1a]'}`}>
                      {p.inventory === 0 ? 'Out of stock' : `${p.inventory} in stock`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] font-semibold text-[#1a1a1a] tabular-nums">{formatCurrency(p.price)}</span>
                  </td>
                  <td className="px-3 py-3 relative" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => toggleMenu(p.id, e)}
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#b5b5b5] hover:text-[#303030] hover:bg-[#f1f1f1] transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-[15px] h-[15px]" />
                    </button>
                    {menuId === p.id && (
                      <div className={`absolute right-4 w-40 bg-white rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] z-20 py-1 ${menuUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                        <button onClick={() => { setMenuId(null); router.push(`/admin/products/${p.id}`) }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#616161] hover:bg-[#f6f6f6] transition-colors">
                          <Pencil className="w-3.5 h-3.5" />Edit
                        </button>
                        {p.status !== 'archived' && (
                          <button onClick={() => { setList(prev => prev.map(x => x.id === p.id ? { ...x, status: 'archived' as const } : x)); setMenuId(null) }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#616161] hover:bg-[#f6f6f6] transition-colors">
                            <Archive className="w-3.5 h-3.5" />Archive
                          </button>
                        )}
                        <div className="h-px bg-[#f0f0f0] my-0.5" />
                        <button onClick={() => { setDelId(p.id); setMenuId(null) }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#e22c38] hover:bg-[#fef1f1] transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <FileText className="w-10 h-10 text-[#d1d1d1] mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[14px] font-medium text-[#8a8a8a]">No products found</p>
                    <button onClick={() => router.push('/admin/products/new')} className="text-[13px] text-[#005bd3] font-medium mt-1 hover:underline">Add your first product</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filtered.length > perPage && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0]">
              <p className="text-[12px] text-[#8a8a8a]">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
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
        </div>

        {/* Delete confirm */}
        <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete product" width="max-w-sm">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#fee8eb] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-[#e22c38]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Are you sure?</p>
            <p className="text-[13px] text-[#616161] mb-5">This action cannot be undone.</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setDelId(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={() => delId && del(delId)} className="btn btn-danger">Delete product</button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
