import { useState, useMemo, useContext } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Archive, Package } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { ToastContext } from '../App'
import {
  products as initialProducts, formatCurrency, type Product, type ProductStatus,
} from '../data/sampleData'

const tabs: { label: string; value: ProductStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

const badgeMap: Record<ProductStatus, 'success' | 'warning' | 'default'> = {
  active: 'success', draft: 'warning', archived: 'default',
}

const emptyForm: Omit<Product, 'id' | 'createdAt'> = {
  name: '', sku: '', price: 0, status: 'draft', category: 'Bridal Gowns',
  inventory: 0, image: '', description: '',
}

export default function Products() {
  const { addToast } = useContext(ToastContext)
  const [list, setList] = useState<Product[]>(initialProducts)
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [delId, setDelId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => list.filter(p => {
    const ms = filter === 'all' || p.status === filter
    const mq = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    return ms && mq
  }), [list, filter, search])

  const counts = useMemo(() => ({
    all: list.length,
    active: list.filter(p => p.status === 'active').length,
    draft: list.filter(p => p.status === 'draft').length,
    archived: list.filter(p => p.status === 'archived').length,
  }), [list])

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, sku: p.sku, price: p.price, status: p.status, category: p.category, inventory: p.inventory, image: p.image, description: p.description })
    setModalOpen(true); setMenuId(null)
  }

  function save() {
    if (!form.name || !form.sku) return
    if (editing) {
      setList(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p))
      addToast('Product updated successfully')
    } else {
      setList(prev => [{
        ...form, id: `prod_${Date.now()}`,
        price: Number(form.price), inventory: Number(form.inventory),
        createdAt: new Date().toISOString().split('T')[0],
      }, ...prev])
      addToast('Product created successfully')
    }
    setModalOpen(false)
  }

  function del(id: string) {
    setList(prev => prev.filter(p => p.id !== id))
    setDelId(null)
    addToast('Product deleted', 'error')
  }

  function bulkDelete() {
    setList(prev => prev.filter(p => !selected.has(p.id)))
    addToast(`${selected.size} products deleted`, 'error')
    setSelected(new Set())
  }

  function toggleSel(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAll() {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)))
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] text-text-primary placeholder:text-text-tertiary hover:border-border-dark transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={bulkDelete}
              className="h-[36px] px-4 rounded-lg bg-red text-white text-[13px] font-medium flex items-center gap-1.5 hover:bg-red-text transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selected.size})
            </button>
          )}
          <button
            onClick={openAdd}
            className="h-[36px] px-4 rounded-lg bg-accent text-white text-[13px] font-medium flex items-center gap-1.5 hover:bg-accent-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Add product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              filter === t.value
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
            <span className="text-text-tertiary ml-1.5 text-[12px]">{counts[t.value as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-5 py-2.5 w-10">
                <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} />
              </th>
              {['Product', 'Status', 'Category', 'Inventory', 'Price', ''].map(h => (
                <th key={h} className={`${h ? 'text-left' : 'text-right'} text-[12px] font-medium text-text-tertiary px-5 py-2.5 whitespace-nowrap`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className={`border-b border-border/50 last:border-0 transition-colors ${selected.has(p.id) ? 'bg-accent/[0.04]' : 'hover:bg-surface/50'}`}>
                <td className="px-5 py-3">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSel(p.id)} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center">
                        <Package className="w-4 h-4 text-text-tertiary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">{p.name}</p>
                      <p className="text-[11px] text-text-tertiary">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><Badge variant={badgeMap[p.status]}>{p.status}</Badge></td>
                <td className="px-5 py-3 text-[13px] text-text-secondary">{p.category}</td>
                <td className="px-5 py-3">
                  <span className={`text-[13px] font-medium ${p.inventory === 0 ? 'text-red' : p.inventory <= 2 ? 'text-yellow' : 'text-text-primary'}`}>
                    {p.inventory === 0 ? 'Out of stock' : `${p.inventory} in stock`}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-semibold text-text-primary">{formatCurrency(p.price)}</span>
                    {p.compareAtPrice && (
                      <span className="text-[11px] text-text-tertiary line-through">{formatCurrency(p.compareAtPrice)}</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-right relative">
                  <button
                    onClick={() => setMenuId(menuId === p.id ? null : p.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-text-secondary" />
                  </button>
                  {menuId === p.id && (
                    <div className="absolute right-5 top-full mt-1 w-40 bg-card rounded-lg shadow-lg border border-border z-20 py-1">
                      <button onClick={() => openEdit(p)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-surface transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      {p.status !== 'archived' && (
                        <button
                          onClick={() => { setList(prev => prev.map(x => x.id === p.id ? { ...x, status: 'archived' as const } : x)); setMenuId(null); addToast('Product archived') }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-surface transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" /> Archive
                        </button>
                      )}
                      <button
                        onClick={() => { setDelId(p.id); setMenuId(null) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red hover:bg-red-bg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <Package className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
                  <p className="text-[13px] text-text-tertiary">No products found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit product' : 'Add product'} width="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-primary mb-1.5">Title</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full h-[36px] px-3 rounded-lg border border-border bg-card text-[13px] text-text-primary placeholder:text-text-tertiary"
              placeholder="Short sleeve t-shirt"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">SKU</label>
              <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full h-[36px] px-3 rounded-lg border border-border bg-card text-[13px]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-[36px] px-3 rounded-lg border border-border bg-card text-[13px]">
                <option>Bridal Gowns</option><option>Ball Gowns</option><option>Evening Dresses</option><option>Cape & Train</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Price (cents)</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full h-[36px] px-3 rounded-lg border border-border bg-card text-[13px]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Inventory</label>
              <input type="number" value={form.inventory} onChange={e => setForm({ ...form, inventory: Number(e.target.value) })} className="w-full h-[36px] px-3 rounded-lg border border-border bg-card text-[13px]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProductStatus })} className="w-full h-[36px] px-3 rounded-lg border border-border bg-card text-[13px]">
                <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-primary mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button onClick={() => setModalOpen(false)} className="h-[36px] px-4 rounded-lg border border-border bg-card text-[13px] font-medium text-text-primary hover:bg-surface transition-colors">
              Cancel
            </button>
            <button onClick={save} className="h-[36px] px-4 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent-dark transition-colors">
              {editing ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete product" width="max-w-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-bg flex items-center justify-center mx-auto mb-3">
            <Trash2 className="w-5 h-5 text-red" />
          </div>
          <p className="text-[14px] font-medium text-text-primary mb-1">Are you sure?</p>
          <p className="text-[13px] text-text-secondary mb-5">This action cannot be undone.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setDelId(null)} className="h-[36px] px-4 rounded-lg border border-border bg-card text-[13px] font-medium text-text-primary hover:bg-surface transition-colors">
              Cancel
            </button>
            <button onClick={() => delId && del(delId)} className="h-[36px] px-4 rounded-lg bg-red text-white text-[13px] font-medium hover:bg-red-text transition-colors">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
