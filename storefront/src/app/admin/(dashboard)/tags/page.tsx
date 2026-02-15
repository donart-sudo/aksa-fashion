'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, Hash, Loader2 } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa, type MedusaProductTag } from '@/lib/admin-medusa'

export default function TagsPage() {
  const { demo } = useAdminAuth()
  const [list, setList] = useState<MedusaProductTag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MedusaProductTag | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  /* Form */
  const [value, setValue] = useState('')

  useEffect(() => {
    loadData()
  }, [demo])

  async function loadData() {
    if (!demo) {
      try {
        const res = await adminMedusa.getProductTags({ limit: '200' })
        setList(res.product_tags)
      } catch { /* empty */ }
    }
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setValue('')
    setModalOpen(true)
  }

  function openEdit(t: MedusaProductTag) {
    setEditing(t)
    setValue(t.value)
    setModalOpen(true)
  }

  async function save() {
    if (!value.trim()) return
    setSaving(true)
    try {
      const data = { value: value.trim() }
      if (!demo) {
        if (editing) {
          await adminMedusa.updateProductTag(editing.id, data)
        } else {
          await adminMedusa.createProductTag(data)
        }
      }
      await loadData()
      setModalOpen(false)
    } catch (err) {
      alert('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  async function del(id: string) {
    if (!demo) {
      try { await adminMedusa.deleteProductTag(id) } catch {}
    }
    setList(prev => prev.filter(t => t.id !== id))
    setDelId(null)
  }

  const filtered = list.filter(t =>
    !search || t.value.toLowerCase().includes(search.toLowerCase())
  )

  // Group tags by first letter
  const grouped = filtered.reduce<Record<string, MedusaProductTag[]>>((acc, tag) => {
    const letter = tag.value[0]?.toUpperCase() || '#'
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(tag)
    return acc
  }, {})
  const sortedLetters = Object.keys(grouped).sort()

  if (loading) {
    return (
      <>
        <TopBar title="Tags" />
        <div className="p-8">
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
            <div className="skeleton h-[300px]" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Tags" subtitle={`${list.length} tags`} actions={
        <button onClick={openAdd} className="btn btn-primary"><Plus className="w-4 h-4" />Create tag</button>
      } />
      <div className="p-8">
        {/* Info banner */}
        <div className="rounded-[12px] px-5 py-4 mb-6 flex items-start gap-3" style={{ background: '#ecfdf5', border: '1px solid #bbf7d0' }}>
          <Hash className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#047b5d' }} />
          <div>
            <p className="text-[13px] font-medium" style={{ color: '#064e3b' }}>What are Tags?</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#047b5d' }}>
              Tags are labels you can attach to products for extra organization — like &quot;best-seller&quot;, &quot;limited-edition&quot;, or &quot;clearance&quot;. They help with filtering and internal organization beyond categories and collections.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b5b5b5]" />
              <input type="text" placeholder="Search tags..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-[280px] h-[36px] pl-9 pr-3 rounded-[10px] border border-[#e3e3e3] bg-[#f9f9f9] text-[13px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white" />
            </div>
            <span className="text-[12px] text-[#8a8a8a]">{filtered.length} tags</span>
          </div>

          {/* Tags display */}
          {filtered.length > 0 ? (
            <div className="p-5">
              {sortedLetters.map(letter => (
                <div key={letter} className="mb-5 last:mb-0">
                  <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] mb-2">{letter}</p>
                  <div className="flex flex-wrap gap-2">
                    {grouped[letter].map(tag => (
                      <div
                        key={tag.id}
                        className="group inline-flex items-center gap-1.5 h-[32px] px-3 rounded-[8px] transition-colors"
                        style={{ background: '#f1f1f1', border: '1px solid #e3e3e3' }}
                      >
                        <Hash className="w-3 h-3" style={{ color: '#8a8a8a' }} />
                        <span className="text-[13px] font-medium text-[#303030]">{tag.value}</span>
                        <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(tag)}
                            className="w-5 h-5 rounded flex items-center justify-center border-none bg-transparent cursor-pointer text-[#b5b5b5] hover:text-[#303030]">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDelId(tag.id)}
                            className="w-5 h-5 rounded flex items-center justify-center border-none bg-transparent cursor-pointer text-[#b5b5b5] hover:text-[#e22c38]">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Hash className="w-10 h-10 text-[#d1d1d1] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-medium text-[#8a8a8a]">No tags yet</p>
              <button onClick={openAdd} className="text-[13px] text-[#005bd3] font-medium mt-1 hover:underline">Create your first tag</button>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit tag' : 'Create tag'} width="max-w-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Tag name</label>
              <input value={value} onChange={e => setValue(e.target.value)}
                className="input w-full" placeholder="e.g. best-seller" autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && value.trim()) save() }}
              />
              <p className="text-[11px] text-[#8a8a8a] mt-1">Tags are used to label and filter products internally</p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving || !value.trim()} className="btn btn-primary">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving&hellip;</> : editing ? 'Save changes' : 'Create tag'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm */}
        <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete tag" width="max-w-sm">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#fee8eb] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-[#e22c38]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Delete this tag?</p>
            <p className="text-[13px] text-[#616161] mb-5">This tag will be removed from all products that use it.</p>
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
