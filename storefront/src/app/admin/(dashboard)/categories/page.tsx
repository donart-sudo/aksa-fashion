'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Pencil, Trash2, Layers, ChevronRight, Loader2, Upload, X, ImageIcon } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa, type MedusaCategory } from '@/lib/admin-medusa'

export default function CategoriesPage() {
  const { demo } = useAdminAuth()
  const [list, setList] = useState<MedusaCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MedusaCategory | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* Form */
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [description, setDescription] = useState('')
  const [parentId, setParentId] = useState<string>('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadData()
  }, [demo])

  async function loadData() {
    try {
      const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/product-categories?limit=100&include_descendants_tree=true&fields=*metadata`,
        { headers: { 'x-publishable-api-key': pk } }
      )
      if (res.ok) {
        const data = await res.json()
        setList(data.product_categories || [])
      }
    } catch {
      if (!demo) {
        try {
          const res = await adminMedusa.getCategories({ limit: '100' })
          setList(res.product_categories)
        } catch { /* empty */ }
      }
    }
    setLoading(false)
  }

  function openAdd(parent?: string) {
    setEditing(null)
    setName('')
    setHandle('')
    setDescription('')
    setParentId(parent || '')
    setImageUrl('')
    setImageFile(null)
    setImagePreview('')
    setModalOpen(true)
  }

  function openEdit(c: MedusaCategory) {
    setEditing(c)
    setName(c.name)
    setHandle(c.handle)
    setDescription(c.description || '')
    setParentId(c.parent_category_id || '')
    const existingImg = (c.metadata as Record<string, unknown>)?.image as string || ''
    setImageUrl(existingImg)
    setImagePreview(existingImg)
    setImageFile(null)
    setModalOpen(true)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return imageUrl || null
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', imageFile)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/admin/uploads`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminMedusa.getToken()}` },
          body: formData,
        }
      )
      if (res.ok) {
        const data = await res.json()
        return data.files?.[0]?.url || null
      }
    } catch { /* upload failed */ }
    finally { setUploading(false) }
    return null
  }

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    try {
      // Upload image if a new file was selected
      let finalImageUrl = imageUrl
      if (imageFile) {
        const uploaded = await uploadImage()
        if (uploaded) finalImageUrl = uploaded
      }

      const data: Record<string, unknown> = {
        name: name.trim(),
        handle: handle.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: description.trim() || undefined,
        metadata: {
          image: finalImageUrl || undefined,
        },
      }
      if (parentId) data.parent_category_id = parentId

      if (!demo) {
        if (editing) {
          await adminMedusa.updateCategory(editing.id, data)
        } else {
          await adminMedusa.createCategory(data)
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
      try { await adminMedusa.deleteCategory(id) } catch {}
    }
    await loadData()
    setDelId(null)
  }

  function getCategoryImage(c: MedusaCategory): string | null {
    return (c.metadata as Record<string, unknown>)?.image as string || null
  }

  // Flatten for display with indent level
  function flattenCategories(cats: MedusaCategory[], depth = 0): { cat: MedusaCategory; depth: number }[] {
    const result: { cat: MedusaCategory; depth: number }[] = []
    for (const c of cats) {
      result.push({ cat: c, depth })
      if (c.category_children?.length) {
        result.push(...flattenCategories(c.category_children, depth + 1))
      }
    }
    return result
  }

  const topLevel = list.filter(c => !c.parent_category_id)
  const flat = flattenCategories(topLevel)
  const filtered = search
    ? flat.filter(({ cat }) => cat.name.toLowerCase().includes(search.toLowerCase()))
    : flat
  const allFlat = flattenCategories(topLevel)

  if (loading) {
    return (
      <>
        <TopBar title="Categories" />
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
      <TopBar title="Categories" subtitle={`${list.length} categories`} actions={
        <button onClick={() => openAdd()} className="btn btn-primary"><Plus className="w-4 h-4" />Add category</button>
      } />
      <div className="p-8">
        {/* Info banner */}
        <div className="rounded-[12px] px-5 py-4 mb-6 flex items-start gap-3" style={{ background: '#f0ebff', border: '1px solid #ddd4ff' }}>
          <Layers className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
          <div>
            <p className="text-[13px] font-medium" style={{ color: '#4c1d95' }}>What are Categories?</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#6d28d9' }}>
              Categories organize your products into a hierarchy — like &quot;Bridal&quot; → &quot;Wedding Gowns&quot; → &quot;A-Line&quot;. They help customers find what they&apos;re looking for and improve your store&apos;s SEO.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b5b5b5]" />
              <input type="text" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-[280px] h-[36px] pl-9 pr-3 rounded-[10px] border border-[#e3e3e3] bg-[#f9f9f9] text-[13px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white" />
            </div>
          </div>

          {/* Category tree */}
          <div>
            {filtered.map(({ cat, depth }) => {
              const catImage = getCategoryImage(cat)
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-5 py-3 border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors group"
                >
                  <div className="flex items-center gap-2.5" style={{ paddingLeft: `${depth * 28}px` }}>
                    {depth > 0 && (
                      <ChevronRight className="w-3 h-3 text-[#d1d1d1]" />
                    )}
                    {catImage ? (
                      <div className="w-9 h-9 rounded-[8px] overflow-hidden shrink-0" style={{ border: '1px solid #e3e3e3' }}>
                        <img src={catImage} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: depth === 0 ? '#f1f1f1' : '#fafafa' }}>
                        <Layers size={14} style={{ color: depth === 0 ? '#616161' : '#b5b5b5' }} />
                      </div>
                    )}
                    <div>
                      <span className="text-[13px] font-medium text-[#1a1a1a]">{cat.name}</span>
                      <span className="text-[11px] font-mono ml-2 px-1.5 py-0.5 rounded-[4px]" style={{ background: '#f1f1f1', color: '#8a8a8a' }}>/{cat.handle}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openAdd(cat.id)}
                      title="Add subcategory"
                      className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#005bd3] hover:bg-[#eaf4ff] transition-colors">
                      <Plus className="w-[14px] h-[14px]" />
                    </button>
                    <button onClick={() => openEdit(cat)}
                      className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#303030] hover:bg-[#f1f1f1] transition-colors">
                      <Pencil className="w-[14px] h-[14px]" />
                    </button>
                    <button onClick={() => setDelId(cat.id)}
                      className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#e22c38] hover:bg-[#fef1f1] transition-colors">
                      <Trash2 className="w-[14px] h-[14px]" />
                    </button>
                  </div>
                </div>
              )
            })}
            {!filtered.length && (
              <div className="py-16 text-center">
                <Layers className="w-10 h-10 text-[#d1d1d1] mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-[14px] font-medium text-[#8a8a8a]">No categories yet</p>
                <button onClick={() => openAdd()} className="text-[13px] text-[#005bd3] font-medium mt-1 hover:underline">Create your first category</button>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'Add category'} width="max-w-md">
          <div className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Category image</label>
              {imagePreview ? (
                <div className="relative w-full h-[140px] rounded-[10px] overflow-hidden" style={{ border: '1px solid #e3e3e3' }}>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-[100px] rounded-[10px] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  style={{ border: '2px dashed #d1d1d1', background: '#fafafa' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#005bd3'; e.currentTarget.style.background = '#eaf4ff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d1d1'; e.currentTarget.style.background = '#fafafa' }}
                >
                  <ImageIcon className="w-5 h-5" style={{ color: '#8a8a8a' }} />
                  <span className="text-[12px] font-medium" style={{ color: '#616161' }}>
                    Click to upload image
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <p className="text-[11px] text-[#8a8a8a] mt-1">Displayed on your storefront when browsing categories</p>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Name</label>
              <input value={name} onChange={e => { setName(e.target.value); if (!editing) setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) }}
                className="input w-full" placeholder="e.g. Wedding Gowns" autoFocus />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Handle</label>
              <input value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="input w-full" placeholder="wedding-gowns" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                className="input w-full" rows={3} placeholder="Optional description for SEO..." />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Parent category</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)} className="input w-full">
                <option value="">None (top-level)</option>
                {allFlat
                  .filter(({ cat }) => cat.id !== editing?.id)
                  .map(({ cat, depth }) => (
                    <option key={cat.id} value={cat.id}>
                      {'  '.repeat(depth)}{cat.name}
                    </option>
                  ))
                }
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving || uploading || !name.trim()} className="btn btn-primary">
                {saving || uploading ? <><Loader2 className="w-4 h-4 animate-spin" />{uploading ? 'Uploading...' : 'Saving...'}</> : editing ? 'Save changes' : 'Create category'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm */}
        <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete category" width="max-w-sm">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#fee8eb] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-[#e22c38]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Delete this category?</p>
            <p className="text-[13px] text-[#616161] mb-5">Products in this category will become uncategorized. Subcategories will also be removed.</p>
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
