'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Pencil, Trash2, FolderOpen, Loader2, Upload, X, ImageIcon } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import TopBar from '@/components/admin/TopBar'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa, type MedusaCollection } from '@/lib/admin-medusa'

export default function CollectionsPage() {
  const { demo } = useAdminAuth()
  const [list, setList] = useState<MedusaCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MedusaCollection | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* Form */
  const [title, setTitle] = useState('')
  const [handle, setHandle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadData()
  }, [demo])

  async function loadData() {
    if (!demo) {
      try {
        const res = await adminMedusa.getCollections({ limit: '100' })
        setList(res.collections)
      } catch { /* empty */ }
    }
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setTitle('')
    setHandle('')
    setDescription('')
    setImageUrl('')
    setImageFile(null)
    setImagePreview('')
    setModalOpen(true)
  }

  function openEdit(c: MedusaCollection) {
    setEditing(c)
    setTitle(c.title)
    setHandle(c.handle)
    const meta = c.metadata as Record<string, unknown> | null
    setDescription((meta?.description as string) || '')
    const existingImg = (meta?.image as string) || ''
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
    if (!title.trim()) return
    setSaving(true)
    try {
      let finalImageUrl = imageUrl
      if (imageFile) {
        const uploaded = await uploadImage()
        if (uploaded) finalImageUrl = uploaded
      }

      const data: Record<string, unknown> = {
        title: title.trim(),
        handle: handle.trim() || title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        metadata: {
          image: finalImageUrl || undefined,
          description: description.trim() || undefined,
        },
      }
      if (!demo) {
        if (editing) {
          await adminMedusa.updateCollection(editing.id, data)
        } else {
          await adminMedusa.createCollection(data)
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
      try { await adminMedusa.deleteCollection(id) } catch {}
    }
    setList(prev => prev.filter(c => c.id !== id))
    setDelId(null)
  }

  function getCollectionImage(c: MedusaCollection): string | null {
    return (c.metadata as Record<string, unknown>)?.image as string || null
  }

  const filtered = list.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <>
        <TopBar title="Collections" />
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
      <TopBar title="Collections" subtitle={`${list.length} collections`} actions={
        <button onClick={openAdd} className="btn btn-primary"><Plus className="w-4 h-4" />Create collection</button>
      } />
      <div className="p-8">
        {/* Info banner */}
        <div className="rounded-[12px] px-5 py-4 mb-6 flex items-start gap-3" style={{ background: '#eaf4ff', border: '1px solid #cce0ff' }}>
          <FolderOpen className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#005bd3' }} />
          <div>
            <p className="text-[13px] font-medium" style={{ color: '#003a5a' }}>What are Collections?</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#005bd3' }}>
              Collections let you group products together — like &quot;New Arrivals&quot;, &quot;Bridal Sale&quot;, or &quot;Best Sellers&quot;. Customers can browse products by collection on your storefront.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b5b5b5]" />
              <input type="text" placeholder="Search collections..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-[280px] h-[36px] pl-9 pr-3 rounded-[10px] border border-[#e3e3e3] bg-[#f9f9f9] text-[13px] text-[#303030] placeholder:text-[#b5b5b5] outline-none transition-all focus:border-[#005bd3] focus:shadow-[0_0_0_2px_rgba(0,91,211,0.12)] focus:bg-white" />
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-5 py-3">Collection</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Handle</th>
                <th className="text-left text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-[0.05em] px-4 py-3">Created</th>
                <th className="w-[100px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const colImage = getCollectionImage(c)
                return (
                  <tr key={c.id} className="border-b border-[#f6f6f6] last:border-0 hover:bg-[#fafafa] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {colImage ? (
                          <div className="w-10 h-10 rounded-[8px] overflow-hidden shrink-0" style={{ border: '1px solid #e3e3e3' }}>
                            <img src={colImage} alt={c.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-[8px] bg-[#f1f1f1] flex items-center justify-center shrink-0">
                            <FolderOpen size={16} className="text-[#8a8a8a]" />
                          </div>
                        )}
                        <div>
                          <span className="text-[13px] font-medium text-[#1a1a1a]">{c.title}</span>
                          {(c.metadata as Record<string, unknown> | null)?.description ? (
                            <p className="text-[11px] text-[#8a8a8a] mt-0.5 line-clamp-1">
                              {String((c.metadata as Record<string, unknown>).description)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[12px] font-mono px-2 py-0.5 rounded-[5px]" style={{ background: '#f1f1f1', color: '#616161' }}>/{c.handle}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-[#616161]">
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)}
                          className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#303030] hover:bg-[#f1f1f1] transition-colors">
                          <Pencil className="w-[14px] h-[14px]" />
                        </button>
                        <button onClick={() => setDelId(c.id)}
                          className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[#b5b5b5] hover:text-[#e22c38] hover:bg-[#fef1f1] transition-colors">
                          <Trash2 className="w-[14px] h-[14px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <FolderOpen className="w-10 h-10 text-[#d1d1d1] mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[14px] font-medium text-[#8a8a8a]">No collections yet</p>
                    <button onClick={openAdd} className="text-[13px] text-[#005bd3] font-medium mt-1 hover:underline">Create your first collection</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit collection' : 'Create collection'} width="max-w-md">
          <div className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Collection image</label>
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
              <p className="text-[11px] text-[#8a8a8a] mt-1">Featured image shown on your storefront collection page</p>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Title</label>
              <input value={title} onChange={e => { setTitle(e.target.value); if (!editing) setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) }}
                className="input w-full" placeholder="e.g. New Arrivals" autoFocus />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Handle</label>
              <div className="flex items-center gap-0">
                <span className="text-[12px] text-[#8a8a8a] shrink-0">/collections/</span>
                <input value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="input flex-1" placeholder="new-arrivals" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                className="input w-full" rows={3} placeholder="Brief description of this collection..." />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving || uploading || !title.trim()} className="btn btn-primary">
                {saving || uploading ? <><Loader2 className="w-4 h-4 animate-spin" />{uploading ? 'Uploading...' : 'Saving...'}</> : editing ? 'Save changes' : 'Create collection'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm */}
        <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete collection" width="max-w-sm">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#fee8eb] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-[#e22c38]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Delete this collection?</p>
            <p className="text-[13px] text-[#616161] mb-5">Products in this collection won&apos;t be deleted.</p>
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
