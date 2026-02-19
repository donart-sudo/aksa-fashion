'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Package, AlertTriangle, CheckCircle, XCircle,
  Loader2, Edit3, ChevronDown, ChevronUp, Box,
} from 'lucide-react'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa, type MedusaProduct } from '@/lib/admin-supabase'

/* ── Types ─────────────────────────────────────────────────────────────── */

interface VariantRow {
  productId: string
  productTitle: string
  productThumbnail: string | null
  productStatus: string
  variantId: string
  variantTitle: string
  inventoryQuantity: number
  sku: string | null
  price: number
  currency: string
}

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'

/* ── Helpers ───────────────────────────────────────────────────────────── */

function formatCurrency(cents: number, currency = 'eur'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: currency.toUpperCase(),
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(cents / 100)
}

function stockStatus(qty: number): { label: string; color: string; bg: string; icon: typeof CheckCircle } {
  if (qty <= 0) return { label: 'Out of stock', color: '#e22c38', bg: '#fee8eb', icon: XCircle }
  if (qty <= 5) return { label: 'Low stock', color: '#b28400', bg: '#fff8db', icon: AlertTriangle }
  return { label: 'In stock', color: '#047b5d', bg: '#ecfdf5', icon: CheckCircle }
}

const LOW_STOCK_THRESHOLD = 5

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function InventoryPage() {
  const router = useRouter()
  const { demo } = useAdminAuth()

  const [rows, setRows] = useState<VariantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [sortBy, setSortBy] = useState<'name' | 'stock'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  // Stock location cache
  const [locationId, setLocationId] = useState<string | null>(null)

  useEffect(() => {
    loadInventory()
  }, [demo])

  async function loadInventory() {
    if (demo) { setLoading(false); return }
    try {
      // Fetch all products with variants
      const res = await adminMedusa.getProducts({ limit: '200', fields: '*variants,*variants.inventory_items' })
      const variantRows: VariantRow[] = []

      for (const p of res.products) {
        for (const v of (p.variants || [])) {
          const price = v.prices?.[0]
          variantRows.push({
            productId: p.id,
            productTitle: p.title,
            productThumbnail: p.thumbnail,
            productStatus: p.status,
            variantId: v.id,
            variantTitle: v.title || 'Default',
            inventoryQuantity: v.inventory_quantity ?? 0,
            sku: (v as Record<string, unknown>).sku as string | null ?? null,
            price: price?.amount ?? 0,
            currency: price?.currency_code ?? 'eur',
          })
        }
      }

      setRows(variantRows)

      // Prefetch stock location for edits
      try {
        const locRes = await adminMedusa.getStockLocations()
        if (locRes.stock_locations?.length > 0) {
          setLocationId(locRes.stock_locations[0].id)
        }
      } catch { /* stock locations not available */ }
    } catch {
      // Failed to load
    } finally {
      setLoading(false)
    }
  }

  /* ── Filtering & sorting ───────────────────────────────────────────── */

  const filtered = useMemo(() => {
    let result = rows.filter(r => {
      const matchSearch = !search ||
        r.productTitle.toLowerCase().includes(search.toLowerCase()) ||
        r.variantTitle.toLowerCase().includes(search.toLowerCase()) ||
        (r.sku && r.sku.toLowerCase().includes(search.toLowerCase()))

      const matchStock =
        stockFilter === 'all' ? true :
        stockFilter === 'out_of_stock' ? r.inventoryQuantity <= 0 :
        stockFilter === 'low_stock' ? r.inventoryQuantity > 0 && r.inventoryQuantity <= LOW_STOCK_THRESHOLD :
        r.inventoryQuantity > LOW_STOCK_THRESHOLD

      return matchSearch && matchStock
    })

    result.sort((a, b) => {
      if (sortBy === 'name') {
        const cmp = a.productTitle.localeCompare(b.productTitle)
        return sortDir === 'asc' ? cmp : -cmp
      }
      const cmp = a.inventoryQuantity - b.inventoryQuantity
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [rows, search, stockFilter, sortBy, sortDir])

  /* ── KPIs ──────────────────────────────────────────────────────────── */

  const totalVariants = rows.length
  const outOfStock = rows.filter(r => r.inventoryQuantity <= 0).length
  const lowStock = rows.filter(r => r.inventoryQuantity > 0 && r.inventoryQuantity <= LOW_STOCK_THRESHOLD).length
  const inStock = rows.filter(r => r.inventoryQuantity > LOW_STOCK_THRESHOLD).length
  const totalUnits = rows.reduce((s, r) => s + r.inventoryQuantity, 0)

  /* ── Inline edit handlers ──────────────────────────────────────────── */

  function startEdit(variantId: string, currentQty: number) {
    setEditingId(variantId)
    setEditValue(currentQty.toString())
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  async function saveEdit(row: VariantRow) {
    const newQty = parseInt(editValue, 10)
    if (isNaN(newQty) || newQty < 0) {
      cancelEdit()
      return
    }
    if (newQty === row.inventoryQuantity) {
      cancelEdit()
      return
    }

    setSaving(true)
    try {
      // Try to update via inventory items API if we have location data
      if (locationId) {
        // Find the inventory item for this variant
        const inventoryRes = await adminMedusa.getInventoryItems({ limit: '1', q: row.variantId })
        const invItem = inventoryRes.inventory_items?.[0]
        if (invItem) {
          await adminMedusa.updateInventoryLevel(invItem.id, locationId, { stocked_quantity: newQty })
        }
      }

      // Update local state optimistically
      setRows(prev => prev.map(r =>
        r.variantId === row.variantId ? { ...r, inventoryQuantity: newQty } : r
      ))
      cancelEdit()
    } catch (err) {
      alert('Failed to update: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  function toggleSort(col: 'name' | 'stock') {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir(col === 'stock' ? 'asc' : 'asc')
    }
  }

  /* ── Render ────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <>
        <TopBar title="Inventory" />
        <div className="p-8">
          <div className="grid grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]"><div className="skeleton h-[68px]" /></div>)}
          </div>
          <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] p-5"><div className="skeleton h-[400px]" /></div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Inventory" subtitle={`${totalVariants} variants across ${new Set(rows.map(r => r.productId)).size} products`} />

      <div className="p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total units', value: totalUnits.toLocaleString(), icon: Box, color: '#005bd3', bg: '#eaf4ff' },
            { label: 'In stock', value: inStock.toString(), icon: CheckCircle, color: '#047b5d', bg: '#ecfdf5' },
            { label: 'Low stock', value: lowStock.toString(), icon: AlertTriangle, color: '#b28400', bg: '#fff8db' },
            { label: 'Out of stock', value: outOfStock.toString(), icon: XCircle, color: '#e22c38', bg: '#fee8eb' },
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

        {/* Alerts */}
        {outOfStock > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] mb-4" style={{ background: '#fee8eb', border: '1px solid #fca5a5' }}>
            <XCircle size={16} style={{ color: '#e22c38' }} />
            <p className="text-[13px] font-medium" style={{ color: '#e22c38' }}>
              {outOfStock} variant{outOfStock > 1 ? 's' : ''} out of stock — customers cannot order these items
            </p>
          </div>
        )}
        {lowStock > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] mb-4" style={{ background: '#fff8db', border: '1px solid #fde68a' }}>
            <AlertTriangle size={16} style={{ color: '#b28400' }} />
            <p className="text-[13px] font-medium" style={{ color: '#b28400' }}>
              {lowStock} variant{lowStock > 1 ? 's' : ''} running low (5 or fewer units)
            </p>
          </div>
        )}

        {/* Main table card */}
        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b5b5b5]" />
              <input
                type="text"
                placeholder="Search products, variants, SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-[300px] h-[36px] pl-9 pr-3 rounded-[10px] border border-[#e3e3e3] bg-[#f9f9f9] text-[13px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white"
              />
            </div>

            {/* Stock filter pills */}
            <div className="flex gap-1.5">
              {([
                { value: 'all' as const, label: 'All', count: totalVariants },
                { value: 'in_stock' as const, label: 'In stock', count: inStock },
                { value: 'low_stock' as const, label: 'Low', count: lowStock },
                { value: 'out_of_stock' as const, label: 'Out', count: outOfStock },
              ]).map(f => (
                <button
                  key={f.value}
                  onClick={() => setStockFilter(f.value)}
                  className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all border-none cursor-pointer"
                  style={{
                    background: stockFilter === f.value ? '#1a1a1a' : '#f1f1f1',
                    color: stockFilter === f.value ? '#ffffff' : '#616161',
                  }}
                >
                  {f.label}
                  <span className="ml-1 opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-5 py-3">
                  <button onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 bg-transparent border-none cursor-pointer text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] p-0">
                    Product
                    {sortBy === 'name' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                </th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Variant</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">SKU</th>
                <th className="text-right text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Price</th>
                <th className="text-center text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">
                  <button onClick={() => toggleSort('stock')} className="inline-flex items-center gap-1 bg-transparent border-none cursor-pointer text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] p-0">
                    Stock
                    {sortBy === 'stock' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                </th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Status</th>
                <th className="w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const ss = stockStatus(row.inventoryQuantity)
                const isEditing = editingId === row.variantId

                return (
                  <tr
                    key={row.variantId}
                    className="border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {row.productThumbnail ? (
                          <img src={row.productThumbnail} alt="" className="w-10 h-10 rounded-[8px] object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-[8px] bg-[#f1f1f1] flex items-center justify-center shrink-0">
                            <Package size={16} className="text-[#b5b5b5]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <button
                            onClick={() => router.push(`/admin/products/${row.productId}`)}
                            className="text-[13px] font-medium text-[#005bd3] hover:underline bg-transparent border-none cursor-pointer p-0 text-left truncate block max-w-[200px]"
                          >
                            {row.productTitle}
                          </button>
                          {row.productStatus === 'draft' && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px]" style={{ background: '#f1f1f1', color: '#8a8a8a' }}>Draft</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-[#616161]">{row.variantTitle}</td>
                    <td className="px-4 py-3.5 text-[12px] font-mono text-[#8a8a8a]">{row.sku || '—'}</td>
                    <td className="px-4 py-3.5 text-right text-[13px] font-semibold text-[#1a1a1a] tabular-nums">
                      {formatCurrency(row.price, row.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(row)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            autoFocus
                            className="w-[70px] h-[30px] px-2 rounded-[6px] border border-[#005bd3] text-[13px] text-center text-[#1a1a1a] outline-none bg-white shadow-[0_0_0_2px_rgba(0,91,211,0.12)]"
                          />
                          {saving ? (
                            <Loader2 size={14} className="animate-spin text-[#8a8a8a]" />
                          ) : (
                            <>
                              <button
                                onClick={() => saveEdit(row)}
                                className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center border-none cursor-pointer transition-colors"
                                style={{ background: '#ecfdf5', color: '#047b5d' }}
                              >
                                <CheckCircle size={13} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center border-none cursor-pointer transition-colors"
                                style={{ background: '#f1f1f1', color: '#616161' }}
                              >
                                <XCircle size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span
                          className="text-[13px] font-semibold tabular-nums"
                          style={{ color: row.inventoryQuantity <= 0 ? '#e22c38' : row.inventoryQuantity <= LOW_STOCK_THRESHOLD ? '#b28400' : '#1a1a1a' }}
                        >
                          {row.inventoryQuantity}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] text-[11px] font-semibold"
                        style={{ background: ss.bg, color: ss.color }}
                      >
                        <ss.icon size={11} />
                        {ss.label}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        onClick={() => startEdit(row.variantId, row.inventoryQuantity)}
                        className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#303030] hover:bg-[#f1f1f1] transition-colors bg-transparent border-none cursor-pointer"
                        title="Edit stock"
                      >
                        <Edit3 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Package className="w-10 h-10 text-[#d1d1d1] mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[14px] font-medium text-[#8a8a8a]">No products found</p>
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
