'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Upload, X, Plus, Trash2,
  ChevronDown, Loader2,
} from 'lucide-react'
import { adminMedusa, type MedusaProduct } from '@/lib/admin-supabase'

/* ── Types ─────────────────────────────────────────────────── */

interface ImageFile {
  id: string
  file?: File
  url: string
  alt: string
  isExisting?: boolean
}

interface VariantOption {
  name: string
  values: string[]
}

interface VariantRow {
  id: string
  medusaId?: string
  title: string
  price: string
  sku: string
  quantity: string
  options: Record<string, string>
}

interface Category {
  id: string
  name: string
  handle: string
}

interface ProductFormProps {
  initialData?: MedusaProduct
  onSave: (data: Record<string, unknown>) => Promise<void>
  mode: 'create' | 'edit'
}

/* ── Helpers ───────────────────────────────────────────────── */

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function generateVariants(options: VariantOption[]): VariantRow[] {
  if (options.length === 0 || options.every(o => o.values.length === 0)) return []
  const combos: Record<string, string>[][] = options.reduce<Record<string, string>[][]>(
    (acc, opt) => {
      if (opt.values.length === 0) return acc
      if (acc.length === 0) return opt.values.map(v => [{ [opt.name]: v }])
      return acc.flatMap(existing =>
        opt.values.map(v => [...existing, { [opt.name]: v }])
      )
    },
    []
  )
  return combos.map(combo => {
    const opts = combo.reduce((a, b) => ({ ...a, ...b }), {})
    return {
      id: generateId(),
      title: Object.values(opts).join(' / '),
      price: '',
      sku: '',
      quantity: '0',
      options: opts,
    }
  })
}

/* ── Field Components ──────────────────────────────────────── */

function Label({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <label className="block mb-1.5">
      <span className="text-[13px] font-medium text-[#303030]">{children}</span>
      {sub && <span className="text-[11px] ml-1.5 text-[#8a8a8a]">{sub}</span>}
    </label>
  )
}

function Input({ label, sub, ...props }: { label?: string; sub?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && <Label sub={sub}>{label}</Label>}
      <input
        {...props}
        className="w-full h-[36px] px-3 rounded-[8px] text-[13px] outline-none transition-all border border-[#e3e3e3] bg-[#fdfdfd] text-[#303030]"
        style={{ fontFamily: 'inherit' }}
        onFocus={e => { e.target.style.borderColor = '#005bd3'; e.target.style.boxShadow = '0 0 0 2px rgba(0,91,211,0.15)' }}
        onBlur={e => { e.target.style.borderColor = '#e3e3e3'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function TextArea({ label, sub, ...props }: { label?: string; sub?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && <Label sub={sub}>{label}</Label>}
      <textarea
        {...props}
        className="w-full px-3 py-2 rounded-[8px] text-[13px] outline-none transition-all resize-y leading-relaxed border border-[#e3e3e3] bg-[#fdfdfd] text-[#303030]"
        style={{ fontFamily: 'inherit' }}
        onFocus={e => { e.target.style.borderColor = '#005bd3'; e.target.style.boxShadow = '0 0 0 2px rgba(0,91,211,0.15)' }}
        onBlur={e => { e.target.style.borderColor = '#e3e3e3'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function Select({ label, children, ...props }: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <select
          {...props}
          className="w-full h-[36px] px-3 pr-8 rounded-[8px] text-[13px] outline-none transition-all appearance-none cursor-pointer border border-[#e3e3e3] bg-[#fdfdfd] text-[#303030]"
          style={{ fontFamily: 'inherit' }}
          onFocus={e => { e.target.style.borderColor = '#005bd3'; e.target.style.boxShadow = '0 0 0 2px rgba(0,91,211,0.15)' }}
          onBlur={e => { e.target.style.borderColor = '#e3e3e3'; e.target.style.boxShadow = 'none' }}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-[#8a8a8a]" />
      </div>
    </div>
  )
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] bg-white border border-[#e3e3e3]">
      {title && (
        <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
          <h3 className="text-[14px] font-semibold text-[#1a1a1a]">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')
  function add(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = input.trim().replace(/,$/, '')
      if (val && !tags.includes(val)) onChange([...tags, val])
      setInput('')
    }
  }
  return (
    <div className="flex flex-wrap gap-1.5 min-h-[36px] px-2 py-1.5 rounded-[8px] cursor-text border border-[#e3e3e3] bg-[#fdfdfd]">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 h-[24px] px-2 rounded-[6px] text-[12px] font-medium bg-[#f1f1f1] text-[#303030]">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="p-0 border-none bg-transparent cursor-pointer flex text-[#8a8a8a]"><X className="w-3 h-3" /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] h-[24px] border-none outline-none bg-transparent text-[13px] text-[#303030]"
      />
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────── */

export default function ProductForm({ initialData, onSave, mode }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* Form state */
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [images, setImages] = useState<ImageFile[]>([])
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState('0')
  const [hasVariants, setHasVariants] = useState(false)
  const [options, setOptions] = useState<VariantOption[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [status, setStatus] = useState<'published' | 'draft'>(
    initialData?.status === 'published' ? 'published' : 'draft'
  )
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  /* Initialize from existing product data */
  useEffect(() => {
    if (!initialData) return

    // Images
    const imgs: ImageFile[] = []
    if (initialData.thumbnail && !initialData.images?.some(img => img.url === initialData.thumbnail)) {
      imgs.push({ id: 'thumb', url: initialData.thumbnail, alt: '', isExisting: true })
    }
    if (initialData.images?.length) {
      initialData.images.forEach(img => {
        imgs.push({ id: img.id, url: img.url, alt: '', isExisting: true })
      })
    }
    setImages(imgs)

    // Pricing + SKU from first variant, quantity = total across all variants
    const firstVariant = initialData.variants?.[0]
    if (firstVariant) {
      const variantPrice = firstVariant.prices?.[0]
      if (variantPrice) setPrice((variantPrice.amount / 100).toFixed(2))
      if (firstVariant.sku) {
        setSku(firstVariant.sku)
      }
    }
    // Show total inventory across all variants
    const totalQty = (initialData.variants || []).reduce((s, v) => s + (v.inventory_quantity || 0), 0)
    setQuantity(totalQty.toString())

    // Category
    if (initialData.categories?.length) {
      setCategoryId(initialData.categories[0].id)
    }

    // Variants
    if (initialData.variants && initialData.variants.length > 1) {
      setHasVariants(true)
      setVariants(initialData.variants.map(v => ({
        id: v.id,
        medusaId: v.id,
        title: v.title,
        price: v.prices?.[0] ? (v.prices[0].amount / 100).toFixed(2) : '',
        sku: '',
        quantity: (v.inventory_quantity || 0).toString(),
        options: {},
      })))
    }
  }, [initialData])

  /* Load categories */
  useEffect(() => {
    async function loadCategories() {
      try {
        const catData = await adminMedusa.getCategories({ limit: '50' })
        setCategories(catData.product_categories || [])
      } catch {}
    }
    loadCategories()
  }, [])

  /* Variant generation for new products */
  useEffect(() => {
    if (hasVariants && !initialData) {
      setVariants(generateVariants(options))
    }
  }, [hasVariants, options, initialData])

  /* Image handling */
  function handleFiles(files: FileList | File[]) {
    const newImages: ImageFile[] = Array.from(files).map(file => ({
      id: generateId(),
      file,
      url: URL.createObjectURL(file),
      alt: '',
    }))
    setImages(prev => [...prev, ...newImages])
  }

  function removeImage(id: string) {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img?.url.startsWith('blob:')) URL.revokeObjectURL(img.url)
      return prev.filter(i => i.id !== id)
    })
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Option management */
  function addOption() {
    setOptions(prev => [...prev, { name: '', values: [] }])
  }

  function updateOptionName(idx: number, name: string) {
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, name } : o))
  }

  function updateOptionValues(idx: number, valStr: string) {
    const values = valStr.split(',').map(v => v.trim()).filter(Boolean)
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, values } : o))
  }

  function removeOption(idx: number) {
    setOptions(prev => prev.filter((_, i) => i !== idx))
  }

  function updateVariant(id: string, field: keyof VariantRow, value: string) {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  /* Save */
  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)

    try {
      const handle = slugify(title)

      const productData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
        handle,
        status,
        metadata: {},
      }

      if (categoryId) {
        productData.categories = [{ id: categoryId }]
      }
      if (tags.length > 0) {
        productData.tags = tags.map(t => ({ value: t }))
      }

      // Images — collect new files and existing URLs
      const newImageFiles = images.filter(i => i.file)
      if (newImageFiles.length > 0) {
        const uploadedUrls: string[] = []
        for (const img of newImageFiles) {
          if (img.file) {
            const formData = new FormData()
            formData.append('files', img.file)
            const uploadRes = await fetch('/api/admin/upload', {
              method: 'POST',
              body: formData,
            })
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json()
              if (uploadData.url) uploadedUrls.push(uploadData.url)
            }
          }
        }
        const existingUrls = images.filter(i => i.isExisting).map(i => i.url)
        const allUrls = [...existingUrls, ...uploadedUrls]
        if (allUrls.length > 0) {
          productData.images = allUrls.map(url => ({ url }))
          productData.thumbnail = allUrls[0]
        }
      }

      if (mode === 'create') {
        // Pass price as top-level so createProduct creates the default variant
        if (price) {
          productData.price = Math.round(Number(price) * 100)
        }
      }

      if (mode === 'edit') {
        // Pass price/quantity/sku so the edit page handler can update the variant
        productData.price = price ? Math.round(Number(price) * 100) : undefined
        productData.quantity = Number(quantity) || 0
        productData.sku = sku || undefined
      }

      await onSave(productData)

      setSaved(true)
      setTimeout(() => router.push('/admin/products'), 800)
    } catch (err) {
      console.error('Failed to save product:', err)
      alert('Failed to save product. Check console for details.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      {/* Top Bar */}
      <header className="h-[52px] flex items-center justify-between px-8 sticky top-0 z-30 bg-white border-b border-[#e3e3e3]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/products')}
            className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center border-none cursor-pointer transition-colors bg-transparent text-[#616161] hover:bg-[#f1f1f1]"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
          <h1 className="text-[16px] font-semibold text-[#1a1a1a]">
            {mode === 'create' ? 'Add product' : 'Edit product'}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => router.push('/admin/products')} className="btn btn-secondary">Discard</button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="btn btn-primary"
            style={saving || !title.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving&hellip;</> : saved ? 'Saved!' : mode === 'create' ? 'Save product' : 'Save changes'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-8 py-6">
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 300px' }}>
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* Title & Description */}
            <Card>
              <div className="space-y-4">
                <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Celestial Ivory Bridal Gown" />
                <TextArea label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Write a product description..." rows={5} />
              </div>
            </Card>

            {/* Media */}
            <Card title="Media">
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {images.map((img, idx) => (
                    <div key={img.id} className="relative group rounded-[8px] overflow-hidden aspect-square" style={{ border: idx === 0 ? '2px solid #005bd3' : '1px solid #e3e3e3' }}>
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] bg-[#005bd3] text-white">Thumbnail</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-[8px] py-8 flex flex-col items-center gap-2 cursor-pointer transition-all"
                style={{ border: `2px dashed ${dragOver ? '#005bd3' : '#d1d1d1'}`, background: dragOver ? '#eaf4ff' : '#fafafa' }}
              >
                <div className="w-10 h-10 rounded-[8px] flex items-center justify-center bg-[#f1f1f1]">
                  <Upload className="w-5 h-5 text-[#8a8a8a]" />
                </div>
                <p className="text-[13px] font-medium text-[#303030]">
                  Drop images here or <span className="text-[#005bd3]">browse</span>
                </p>
                <p className="text-[11px] text-[#8a8a8a]">JPEG, PNG, WebP — up to 10 MB each</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
            </Card>

            {/* Pricing */}
            <Card title="Pricing">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price" sub="EUR" type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                <Input label="Compare at price" sub="EUR" type="number" step="0.01" min="0" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} placeholder="0.00" />
              </div>
            </Card>

            {/* Inventory */}
            <Card title="Inventory">
              <div className="grid grid-cols-2 gap-4">
                <Input label="SKU" value={sku} onChange={e => setSku(e.target.value)} placeholder="AKS-BG-001" />
                <Input label="Quantity" type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
            </Card>

            {/* Variants */}
            <Card title="Variants">
              <div className="space-y-4">
                {hasVariants && variants.length > 0 ? (
                  <>
                    {/* Option rows (create mode only) */}
                    {mode === 'create' && (
                      <>
                        <div className="space-y-3">
                          {options.map((opt, idx) => (
                            <div key={idx} className="grid gap-3" style={{ gridTemplateColumns: '1fr 2fr auto' }}>
                              <div>
                                {idx === 0 && <Label>Option name</Label>}
                                <select
                                  value={opt.name}
                                  onChange={e => updateOptionName(idx, e.target.value)}
                                  className="w-full h-[36px] px-3 rounded-[8px] text-[13px] outline-none appearance-none cursor-pointer border border-[#e3e3e3] bg-[#fdfdfd] text-[#303030]"
                                  style={{ fontFamily: 'inherit' }}
                                >
                                  <option value="">Select...</option>
                                  <option value="Size">Size</option>
                                  <option value="Color">Color</option>
                                  <option value="Material">Material</option>
                                  <option value="Style">Style</option>
                                </select>
                              </div>
                              <div>
                                {idx === 0 && <Label>Option values</Label>}
                                <input
                                  value={opt.values.join(', ')}
                                  onChange={e => updateOptionValues(idx, e.target.value)}
                                  placeholder="Separate with commas: S, M, L, XL"
                                  className="w-full h-[36px] px-3 rounded-[8px] text-[13px] outline-none border border-[#e3e3e3] bg-[#fdfdfd] text-[#303030]"
                                  style={{ fontFamily: 'inherit' }}
                                />
                              </div>
                              <div className={idx === 0 ? 'mt-[22px]' : ''}>
                                <button
                                  type="button"
                                  onClick={() => removeOption(idx)}
                                  className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center border-none cursor-pointer transition-colors bg-transparent text-[#b5b5b5] hover:bg-[#fee8eb] hover:text-[#e22c38]"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {options.length < 3 && (
                          <button
                            type="button"
                            onClick={addOption}
                            className="flex items-center gap-1.5 text-[13px] font-medium border-none bg-transparent cursor-pointer text-[#005bd3]"
                          >
                            <Plus className="w-4 h-4" />
                            Add another option
                          </button>
                        )}
                      </>
                    )}

                    {/* Variant table */}
                    <div className="rounded-[8px] overflow-hidden border border-[#e3e3e3]">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#f9f9f9] border-b border-[#e3e3e3]">
                            <th className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] px-3 py-2.5 text-[#8a8a8a]">Variant</th>
                            <th className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] px-3 py-2.5 text-[#8a8a8a]">Price</th>
                            <th className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] px-3 py-2.5 text-[#8a8a8a]">Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map(v => (
                            <tr key={v.id} className="border-b border-[#f0f0f0] last:border-0">
                              <td className="px-3 py-2"><span className="text-[13px] font-medium text-[#1a1a1a]">{v.title}</span></td>
                              <td className="px-3 py-2">
                                <input type="number" step="0.01" value={v.price} onChange={e => updateVariant(v.id, 'price', e.target.value)} placeholder={price || '0.00'}
                                  className="w-[90px] h-[30px] px-2 rounded-[6px] text-[12px] outline-none border border-[#e3e3e3] text-[#303030]" style={{ fontFamily: 'inherit' }} />
                              </td>
                              <td className="px-3 py-2">
                                <input type="number" min="0" value={v.quantity} onChange={e => updateVariant(v.id, 'quantity', e.target.value)}
                                  className="w-[70px] h-[30px] px-2 rounded-[6px] text-[12px] outline-none border border-[#e3e3e3] text-[#303030]" style={{ fontFamily: 'inherit' }} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : hasVariants ? (
                  <>
                    {mode === 'create' && (
                      <div className="space-y-3">
                        {options.map((opt, idx) => (
                          <div key={idx} className="grid gap-3" style={{ gridTemplateColumns: '1fr 2fr auto' }}>
                            <div>
                              {idx === 0 && <Label>Option name</Label>}
                              <select
                                value={opt.name}
                                onChange={e => updateOptionName(idx, e.target.value)}
                                className="w-full h-[36px] px-3 rounded-[8px] text-[13px] outline-none appearance-none cursor-pointer border border-[#e3e3e3] bg-[#fdfdfd] text-[#303030]"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <option value="">Select...</option>
                                <option value="Size">Size</option>
                                <option value="Color">Color</option>
                                <option value="Material">Material</option>
                                <option value="Style">Style</option>
                              </select>
                            </div>
                            <div>
                              {idx === 0 && <Label>Option values</Label>}
                              <input
                                value={opt.values.join(', ')}
                                onChange={e => updateOptionValues(idx, e.target.value)}
                                placeholder="Separate with commas: S, M, L, XL"
                                className="w-full h-[36px] px-3 rounded-[8px] text-[13px] outline-none border border-[#e3e3e3] bg-[#fdfdfd] text-[#303030]"
                                style={{ fontFamily: 'inherit' }}
                              />
                            </div>
                            <div className={idx === 0 ? 'mt-[22px]' : ''}>
                              <button
                                type="button"
                                onClick={() => removeOption(idx)}
                                className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center border-none cursor-pointer transition-colors bg-transparent text-[#b5b5b5] hover:bg-[#fee8eb] hover:text-[#e22c38]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {options.length < 3 && (
                          <button
                            type="button"
                            onClick={addOption}
                            className="flex items-center gap-1.5 text-[13px] font-medium border-none bg-transparent cursor-pointer text-[#005bd3]"
                          >
                            <Plus className="w-4 h-4" />
                            Add another option
                          </button>
                        )}
                      </div>
                    )}
                    {mode === 'edit' && (
                      <p className="text-[13px] text-[#8a8a8a]">No variants configured.</p>
                    )}
                  </>
                ) : (
                  <div>
                    {mode === 'create' && (
                      <button
                        type="button"
                        onClick={() => { setHasVariants(true); if (options.length === 0) addOption() }}
                        className="flex items-center gap-1.5 text-[13px] font-medium border-none bg-transparent cursor-pointer text-[#005bd3]"
                      >
                        <Plus className="w-4 h-4" />
                        Add options like size or color
                      </button>
                    )}
                    {mode === 'edit' && (
                      <p className="text-[13px] text-[#8a8a8a]">This product uses a single default variant.</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            <Card title="Status">
              <Select value={status} onChange={e => setStatus(e.target.value as 'published' | 'draft')}>
                <option value="draft">Draft</option>
                <option value="published">Active</option>
              </Select>
              <p className="text-[11px] mt-2 text-[#8a8a8a]">
                {status === 'published' ? 'Visible on your storefront.' : 'Hidden from your storefront.'}
              </p>
            </Card>

            <Card title="Category">
              <Select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Card>

            <Card title="Tags">
              <TagInput tags={tags} onChange={setTags} placeholder="Add tags (press Enter)" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
