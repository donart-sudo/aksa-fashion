'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Upload, X, Plus, Trash2, ImageIcon,
  ChevronDown, Loader2,
} from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa, type MedusaProduct } from '@/lib/admin-medusa'

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
  compareAtPrice: string
  sku: string
  quantity: string
  options: Record<string, string>
}

interface Category {
  id: string
  name: string
  handle: string
}

/* ── Helpers ───────────────────────────────────────────────── */

function generateId() {
  return Math.random().toString(36).slice(2, 10)
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
      compareAtPrice: '',
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
      <span className="text-[13px] font-medium" style={{ color: '#303030' }}>{children}</span>
      {sub && <span className="text-[11px] ml-1.5" style={{ color: '#8a8a8a' }}>{sub}</span>}
    </label>
  )
}

function Input({ label, sub, ...props }: { label?: string; sub?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && <Label sub={sub}>{label}</Label>}
      <input
        {...props}
        className="w-full h-[36px] px-3 rounded-[8px] text-[13px] outline-none transition-all"
        style={{ border: '1px solid #e3e3e3', background: '#fdfdfd', color: '#303030', fontFamily: 'inherit' }}
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
        className="w-full px-3 py-2 rounded-[8px] text-[13px] outline-none transition-all resize-y leading-relaxed"
        style={{ border: '1px solid #e3e3e3', background: '#fdfdfd', color: '#303030', fontFamily: 'inherit' }}
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
          className="w-full h-[36px] px-3 pr-8 rounded-[8px] text-[13px] outline-none transition-all appearance-none cursor-pointer"
          style={{ border: '1px solid #e3e3e3', background: '#fdfdfd', color: '#303030', fontFamily: 'inherit' }}
          onFocus={e => { e.target.style.borderColor = '#005bd3'; e.target.style.boxShadow = '0 0 0 2px rgba(0,91,211,0.15)' }}
          onBlur={e => { e.target.style.borderColor = '#e3e3e3'; e.target.style.boxShadow = 'none' }}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#8a8a8a' }} />
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative w-[40px] h-[22px] rounded-full border-none cursor-pointer shrink-0 transition-colors duration-200"
        style={{ background: checked ? '#047b5d' : '#e3e3e3' }}
      >
        <span
          className="absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200"
          style={{
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
      <span className="text-[13px] font-medium" style={{ color: '#303030' }}>{label}</span>
    </label>
  )
}

function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[14px] ${className}`} style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)' }}>
      {title && (
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h3 className="text-[14px] font-semibold" style={{ color: '#1a1a1a' }}>{title}</h3>
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
    <div
      className="flex flex-wrap gap-1.5 min-h-[36px] px-2 py-1.5 rounded-[8px] cursor-text"
      style={{ border: '1px solid #e3e3e3', background: '#fdfdfd' }}
    >
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 h-[24px] px-2 rounded-[6px] text-[12px] font-medium" style={{ background: '#f1f1f1', color: '#303030' }}>
          {tag}
          <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="p-0 border-none bg-transparent cursor-pointer flex" style={{ color: '#8a8a8a' }}><X className="w-3 h-3" /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] h-[24px] border-none outline-none bg-transparent text-[13px]"
        style={{ color: '#303030' }}
      />
    </div>
  )
}

/* ── Main Page Component ───────────────────────────────────── */

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { demo } = useAdminAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loadingProduct, setLoadingProduct] = useState(true)

  /* Form state */
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [costPerItem, setCostPerItem] = useState('')
  const [sku, setSku] = useState('')
  const [barcode, setBarcode] = useState('')
  const [trackQuantity, setTrackQuantity] = useState(true)
  const [quantity, setQuantity] = useState('0')
  const [continueOos, setContinueOos] = useState(false)
  const [isPhysical, setIsPhysical] = useState(true)
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [hasVariants, setHasVariants] = useState(false)
  const [options, setOptions] = useState<VariantOption[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [urlHandle, setUrlHandle] = useState('')
  const [status, setStatus] = useState<'published' | 'draft'>('draft')
  const [categoryId, setCategoryId] = useState('')
  const [productType, setProductType] = useState('')
  const [vendor, setVendor] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  /* Load product and categories */
  useEffect(() => {
    async function loadProduct() {
      try {
        const [productRes] = await Promise.all([
          adminMedusa.getProduct(productId),
        ])
        const p = productRes.product
        setTitle(p.title)
        setDescription(p.description || '')
        setUrlHandle(p.handle)
        setStatus(p.status === 'published' ? 'published' : 'draft')
        setWeight(p.variants?.[0] ? '' : '')

        // Load existing images
        if (p.images?.length) {
          setImages(p.images.map(img => ({
            id: img.id,
            url: img.url,
            alt: '',
            isExisting: true,
          })))
        }
        if (p.thumbnail && !p.images?.some(img => img.url === p.thumbnail)) {
          setImages(prev => [{ id: 'thumb', url: p.thumbnail!, alt: '', isExisting: true }, ...prev])
        }

        // Pricing from first variant
        const firstVariant = p.variants?.[0]
        if (firstVariant) {
          const variantPrice = firstVariant.prices?.[0]
          if (variantPrice) setPrice((variantPrice.amount / 100).toFixed(2))
          if (firstVariant.inventory_quantity !== undefined) {
            setQuantity(firstVariant.inventory_quantity.toString())
          }
        }

        // Metadata
        const meta = (p as Record<string, unknown>).metadata as Record<string, unknown> | undefined
        if (meta) {
          setSeoTitle((meta.seo_title as string) || '')
          setSeoDescription((meta.seo_description as string) || '')
          setVendor((meta.vendor as string) || '')
          setProductType((meta.product_type as string) || '')
          if (meta.cost_per_item) setCostPerItem(meta.cost_per_item.toString())
        }

        // Categories
        if (p.categories?.length) {
          setCategoryId(p.categories[0].id)
        }

        // Variants
        if (p.variants && p.variants.length > 1) {
          setHasVariants(true)
          setVariants(p.variants.map(v => ({
            id: v.id,
            medusaId: v.id,
            title: v.title,
            price: v.prices?.[0] ? (v.prices[0].amount / 100).toFixed(2) : '',
            compareAtPrice: '',
            sku: '',
            quantity: (v.inventory_quantity || 0).toString(),
            options: {},
          })))
        }
      } catch (err) {
        console.error('Failed to load product:', err)
      }
      setLoadingProduct(false)
    }

    async function loadCategories() {
      try {
        const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
        const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/product-categories?limit=50`, {
          headers: { 'x-publishable-api-key': pk },
        })
        if (res.ok) {
          const data = await res.json()
          setCategories(data.product_categories || [])
        }
      } catch {}
    }

    loadProduct()
    loadCategories()
  }, [productId])

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

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
      const productData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
        handle: urlHandle || slugify(title),
        status,
        weight: weight ? Number(weight) : undefined,
        length: length ? Number(length) : undefined,
        width: width ? Number(width) : undefined,
        height: height ? Number(height) : undefined,
        metadata: {
          seo_title: seoTitle || undefined,
          seo_description: seoDescription || undefined,
          vendor: vendor || undefined,
          product_type: productType || undefined,
          cost_per_item: costPerItem ? Number(costPerItem) : undefined,
        },
      }

      if (categoryId) {
        productData.categories = [{ id: categoryId }]
      }

      if (tags.length > 0) {
        productData.tags = tags.map(t => ({ value: t }))
      }

      if (!demo) {
        // Upload new images
        const newImages = images.filter(i => i.file)
        if (newImages.length > 0) {
          const uploadedUrls: string[] = []
          for (const img of newImages) {
            if (img.file) {
              const formData = new FormData()
              formData.append('files', img.file)
              const uploadRes = await fetch(
                `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/admin/uploads`,
                {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${adminMedusa.getToken()}` },
                  body: formData,
                }
              )
              if (uploadRes.ok) {
                const uploadData = await uploadRes.json()
                const url = uploadData.files?.[0]?.url
                if (url) uploadedUrls.push(url)
              }
            }
          }
          // Combine existing + new image URLs
          const existingUrls = images.filter(i => i.isExisting).map(i => i.url)
          const allUrls = [...existingUrls, ...uploadedUrls]
          if (allUrls.length > 0) {
            productData.images = allUrls.map(url => ({ url }))
            productData.thumbnail = allUrls[0]
          }
        }

        await adminMedusa.updateProduct(productId, productData)
      }

      setSaved(true)
      setTimeout(() => router.push('/admin/products'), 800)
    } catch (err) {
      console.error('Failed to save product:', err)
      alert('Failed to save product. Check console for details.')
    } finally {
      setSaving(false)
    }
  }

  const margin = price && costPerItem
    ? (((Number(price) - Number(costPerItem)) / Number(price)) * 100).toFixed(1)
    : null
  const profit = price && costPerItem
    ? (Number(price) - Number(costPerItem)).toFixed(2)
    : null

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f1f1f1' }}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#005bd3' }} />
          <span className="text-[14px] font-medium" style={{ color: '#616161' }}>Loading product...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f1f1f1' }}>
      {/* Top Bar */}
      <header
        className="h-[60px] flex items-center justify-between px-8 sticky top-0 z-30"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e3e3e3' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/products')}
            className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center border-none cursor-pointer transition-colors"
            style={{ background: 'transparent', color: '#616161' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f1f1' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
          <h1 className="text-[18px] font-semibold" style={{ color: '#1a1a1a' }}>Edit product</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => router.push('/admin/products')} className="btn btn-secondary">Discard</button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="btn btn-primary"
            style={saving || !title.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving&hellip;</> : saved ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 340px' }}>
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* Title & Description */}
            <Card>
              <div className="space-y-4">
                <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Product title" />
                <TextArea label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Write a product description..." rows={6} />
              </div>
            </Card>

            {/* Media */}
            <Card title="Media">
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {images.map((img, idx) => (
                    <div key={img.id} className="relative group rounded-[10px] overflow-hidden aspect-square" style={{ border: idx === 0 ? '2px solid #005bd3' : '1px solid #e3e3e3' }}>
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px]" style={{ background: '#005bd3', color: '#fff' }}>Thumbnail</span>
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
                className="rounded-[10px] py-8 flex flex-col items-center gap-2 cursor-pointer transition-all"
                style={{ border: `2px dashed ${dragOver ? '#005bd3' : '#d1d1d1'}`, background: dragOver ? '#eaf4ff' : '#fafafa' }}
              >
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: '#f1f1f1' }}>
                  <Upload className="w-5 h-5" style={{ color: '#8a8a8a' }} />
                </div>
                <p className="text-[13px] font-medium" style={{ color: '#303030' }}>
                  Drop images here or <span style={{ color: '#005bd3' }}>browse</span>
                </p>
                <p className="text-[11px]" style={{ color: '#8a8a8a' }}>JPEG, PNG, WebP, GIF — up to 10 MB each</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
            </Card>

            {/* Pricing */}
            <Card title="Pricing">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Price" sub="EUR" type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                  <Input label="Compare at price" sub="EUR" type="number" step="0.01" min="0" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Cost per item" sub="EUR" type="number" step="0.01" min="0" value={costPerItem} onChange={e => setCostPerItem(e.target.value)} placeholder="0.00" />
                  {margin !== null && <div><Label>Margin</Label><div className="h-[36px] flex items-center text-[13px] font-medium" style={{ color: '#303030' }}>{margin}%</div></div>}
                  {profit !== null && <div><Label>Profit</Label><div className="h-[36px] flex items-center text-[13px] font-medium" style={{ color: '#047b5d' }}>&euro;{profit}</div></div>}
                </div>
              </div>
            </Card>

            {/* Inventory */}
            <Card title="Inventory">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SKU (Stock Keeping Unit)" value={sku} onChange={e => setSku(e.target.value)} placeholder="AKS-BG-001" />
                  <Input label="Barcode (ISBN, UPC, GTIN)" value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-3">
                  <Toggle checked={trackQuantity} onChange={setTrackQuantity} label="Track quantity" />
                  {trackQuantity && (
                    <>
                      <div className="w-[200px]">
                        <Input label="Quantity" type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
                      </div>
                      <Toggle checked={continueOos} onChange={setContinueOos} label="Continue selling when out of stock" />
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Shipping */}
            <Card title="Shipping">
              <div className="space-y-4">
                <Toggle checked={isPhysical} onChange={setIsPhysical} label="This is a physical product" />
                {isPhysical && (
                  <div className="grid grid-cols-4 gap-3">
                    <Input label="Weight" sub="kg" type="number" step="0.01" min="0" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.0" />
                    <Input label="Length" sub="cm" type="number" min="0" value={length} onChange={e => setLength(e.target.value)} placeholder="0" />
                    <Input label="Width" sub="cm" type="number" min="0" value={width} onChange={e => setWidth(e.target.value)} placeholder="0" />
                    <Input label="Height" sub="cm" type="number" min="0" value={height} onChange={e => setHeight(e.target.value)} placeholder="0" />
                  </div>
                )}
              </div>
            </Card>

            {/* Variants */}
            <Card title="Variants">
              <div className="space-y-4">
                {hasVariants && variants.length > 0 ? (
                  <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid #e3e3e3' }}>
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e3e3e3' }}>
                          <th className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] px-3 py-2.5" style={{ color: '#8a8a8a' }}>Variant</th>
                          <th className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] px-3 py-2.5" style={{ color: '#8a8a8a' }}>Price</th>
                          <th className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] px-3 py-2.5" style={{ color: '#8a8a8a' }}>Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map(v => (
                          <tr key={v.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td className="px-3 py-2"><span className="text-[13px] font-medium" style={{ color: '#1a1a1a' }}>{v.title}</span></td>
                            <td className="px-3 py-2">
                              <input type="number" step="0.01" value={v.price} onChange={e => updateVariant(v.id, 'price', e.target.value)} placeholder={price || '0.00'}
                                className="w-[90px] h-[30px] px-2 rounded-[6px] text-[12px] outline-none" style={{ border: '1px solid #e3e3e3', color: '#303030', fontFamily: 'inherit' }} />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" min="0" value={v.quantity} onChange={e => updateVariant(v.id, 'quantity', e.target.value)}
                                className="w-[70px] h-[30px] px-2 rounded-[6px] text-[12px] outline-none" style={{ border: '1px solid #e3e3e3', color: '#303030', fontFamily: 'inherit' }} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[13px]" style={{ color: '#8a8a8a' }}>
                    {hasVariants ? 'No variants configured.' : 'This product uses a single default variant.'}
                  </p>
                )}
              </div>
            </Card>

            {/* SEO */}
            <Card title="Search engine listing">
              <div className="rounded-[10px] p-4 mb-4" style={{ background: '#f9f9f9' }}>
                <p className="text-[14px] font-medium truncate" style={{ color: '#1a0dab' }}>{seoTitle || title || 'Page title'}</p>
                <p className="text-[12px] truncate mt-0.5" style={{ color: '#047b5d' }}>aksafashion.com/products/{urlHandle || 'url-handle'}</p>
                <p className="text-[12px] mt-1 line-clamp-2" style={{ color: '#545454' }}>
                  {seoDescription || description?.slice(0, 160) || 'Add a meta description to help this product appear in search results.'}
                </p>
              </div>
              <div className="space-y-4">
                <Input label="Page title" sub={`${(seoTitle || title).length}/70`} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title || 'Page title for search engines'} maxLength={70} />
                <TextArea label="Meta description" sub={`${(seoDescription || description?.slice(0, 160) || '').length}/160`} value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder="Brief description for search engine results..." rows={3} maxLength={160} />
                <Input label="URL handle" value={urlHandle} onChange={e => setUrlHandle(e.target.value)} placeholder="product-url-handle" />
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (SIDEBAR) */}
          <div className="space-y-5">
            <Card title="Status">
              <Select value={status} onChange={e => setStatus(e.target.value as 'published' | 'draft')}>
                <option value="draft">Draft</option>
                <option value="published">Active</option>
              </Select>
              <p className="text-[11px] mt-2" style={{ color: '#8a8a8a' }}>
                {status === 'published' ? 'This product is visible on your storefront.' : 'This product is hidden from your storefront.'}
              </p>
            </Card>

            <Card title="Product organization">
              <div className="space-y-4">
                <Select label="Category" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Input label="Product type" value={productType} onChange={e => setProductType(e.target.value)} placeholder="e.g. Bridal Gown, Evening Dress" />
                <Input label="Vendor" value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g. Aksa Fashion" />
                <div>
                  <Label>Tags</Label>
                  <TagInput tags={tags} onChange={setTags} placeholder="Add tags (press Enter)" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
