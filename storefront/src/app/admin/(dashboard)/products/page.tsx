'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Archive } from 'lucide-react'
import Badge from '@/components/admin/Badge'
import Modal from '@/components/admin/Modal'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-medusa'
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

const empty: Omit<Product, 'id' | 'createdAt'> = {
  name: '', sku: '', price: 0, status: 'draft', category: 'Bridal Gowns',
  inventory: 0, image: '', description: '',
}

export default function AdminProductsPage() {
  const { demo } = useAdminAuth()
  const [list, setList] = useState<Product[]>(demoProducts)
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(empty)
  const [delId, setDelId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [loading, setLoading] = useState(!demo)

  useEffect(() => {
    if (demo) return
    let cancel = false
    adminMedusa.getProducts({ limit: '50' }).then(res => {
      if (cancel) return
      setList(res.products.map(p => ({
        id: p.id, name: p.title, sku: p.variants[0]?.id?.slice(0, 12) || '',
        price: p.variants[0]?.prices[0]?.amount || 0,
        status: p.status === 'published' ? 'active' as const : p.status === 'draft' ? 'draft' as const : 'archived' as const,
        category: p.categories[0]?.name || 'Uncategorized',
        inventory: p.variants.reduce((s, v) => s + (v.inventory_quantity || 0), 0),
        image: p.thumbnail || '', description: p.description || '', createdAt: p.created_at,
      })))
    }).catch(() => {}).finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [demo])

  const filtered = useMemo(() => list.filter(p => {
    const ms = filter === 'all' || p.status === filter
    const mq = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    return ms && mq
  }), [list, filter, search])

  const counts = useMemo(() => ({
    all: list.length, active: list.filter(p => p.status === 'active').length,
    draft: list.filter(p => p.status === 'draft').length, archived: list.filter(p => p.status === 'archived').length,
  }), [list])

  function openAdd() { setEditing(null); setForm(empty); setModalOpen(true) }
  function openEdit(p: Product) {
    setEditing(p); setForm({ name: p.name, sku: p.sku, price: p.price, status: p.status, category: p.category, inventory: p.inventory, image: p.image, description: p.description })
    setModalOpen(true); setMenuId(null)
  }

  async function save() {
    if (!form.name || !form.sku) return
    if (!demo) {
      try {
        if (editing) {
          await adminMedusa.updateProduct(editing.id, { title: form.name, description: form.description, status: form.status === 'active' ? 'published' : form.status })
        } else {
          await adminMedusa.createProduct({ title: form.name, description: form.description, status: form.status === 'active' ? 'published' : form.status })
        }
      } catch { /* fallback to local */ }
    }
    if (editing) {
      setList(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p))
    } else {
      setList(prev => [{ ...form, id: `prod_${Date.now()}`, price: Number(form.price), inventory: Number(form.inventory), createdAt: new Date().toISOString().split('T')[0] }, ...prev])
    }
    setModalOpen(false)
  }

  async function del(id: string) {
    if (!demo) { try { await adminMedusa.deleteProduct(id) } catch {} }
    setList(prev => prev.filter(p => p.id !== id))
    setDelId(null)
  }

  if (loading) return <><TopBar title="Products" /><div className="p-6"><div className="card p-5"><div className="skeleton h-[400px]" /></div></div></>

  return (
    <>
      <TopBar title="Products" />
      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <input type="text" placeholder="Search products" value={search} onChange={e => setSearch(e.target.value)} className="input w-full pl-8" />
          </div>
          <button onClick={openAdd} className="btn btn-primary"><Plus className="w-4 h-4" />Add product</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-edge">
          {tabs.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              className={`px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${filter === t.value ? 'border-ink text-ink' : 'border-transparent text-ink-light hover:text-ink'}`}>
              {t.label} <span className="text-ink-faint ml-1">{counts[t.value as keyof typeof counts]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge bg-card-hover">
                {['Product','Status','Category','Inventory','Price',''].map(h => (
                  <th key={h} className={`text-${h ? 'left' : 'right'} text-[12px] font-medium text-ink-faint px-5 py-2.5`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-edge-light last:border-0 hover:bg-card-hover transition-colors">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <div><p className="text-[13px] font-medium text-ink">{p.name}</p><p className="text-[11px] text-ink-faint">{p.sku}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-2.5"><Badge variant={badgeMap[p.status]}>{p.status}</Badge></td>
                  <td className="px-5 py-2.5 text-[13px] text-ink-light">{p.category}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[13px] font-medium ${p.inventory === 0 ? 'text-crit' : p.inventory <= 2 ? 'text-warn' : 'text-ink'}`}>
                      {p.inventory === 0 ? 'Out of stock' : `${p.inventory} in stock`}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="text-[13px] font-medium text-ink">{formatCurrency(p.price)}</span>
                    {p.compareAtPrice && <span className="text-[11px] text-ink-faint line-through ml-1">{formatCurrency(p.compareAtPrice)}</span>}
                  </td>
                  <td className="px-5 py-2.5 text-right relative">
                    <button onClick={() => setMenuId(menuId === p.id ? null : p.id)} className="btn-plain w-8 h-8 !p-0 rounded-lg">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuId === p.id && (
                      <div className="absolute right-5 top-full mt-1 w-36 card shadow-lg z-20 py-1">
                        <button onClick={() => openEdit(p)} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-ink-light hover:bg-card-hover"><Pencil className="w-3.5 h-3.5" />Edit</button>
                        {p.status !== 'archived' && <button onClick={() => { setList(prev => prev.map(x => x.id === p.id ? { ...x, status: 'archived' as const } : x)); setMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-ink-light hover:bg-card-hover"><Archive className="w-3.5 h-3.5" />Archive</button>}
                        <button onClick={() => { setDelId(p.id); setMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-crit hover:bg-crit-surface"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-[13px] text-ink-faint">No products found</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit product' : 'Add product'} width="max-w-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1">Title</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input w-full" placeholder="Short sleeve t-shirt" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[13px] font-medium text-ink mb-1">SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="input w-full" /></div>
              <div><label className="block text-[13px] font-medium text-ink mb-1">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input w-full">
                <option>Bridal Gowns</option><option>Ball Gowns</option><option>Evening Dresses</option><option>Cape & Train</option>
              </select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-[13px] font-medium text-ink mb-1">Price (cents)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input w-full" /></div>
              <div><label className="block text-[13px] font-medium text-ink mb-1">Inventory</label><input type="number" value={form.inventory} onChange={e => setForm({ ...form, inventory: Number(e.target.value) })} className="input w-full" /></div>
              <div><label className="block text-[13px] font-medium text-ink mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProductStatus })} className="input w-full">
                <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
              </select></div>
            </div>
            <div><label className="block text-[13px] font-medium text-ink mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input w-full" /></div>
            <div className="flex justify-end gap-2 pt-3 border-t border-edge">
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={save} className="btn btn-primary">{editing ? 'Save' : 'Add product'}</button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm */}
        <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete product" width="max-w-sm">
          <div className="text-center">
            <p className="text-[13px] text-ink-light mb-5">Are you sure? This can&apos;t be undone.</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setDelId(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={() => delId && del(delId)} className="btn btn-danger">Delete</button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
