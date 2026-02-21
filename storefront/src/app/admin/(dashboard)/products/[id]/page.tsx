'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa, type MedusaProduct } from '@/lib/admin-supabase'
import ProductForm from '@/components/admin/ProductForm'

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string
  const { demo } = useAdminAuth()
  const [product, setProduct] = useState<MedusaProduct | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await adminMedusa.getProduct(productId)
        setProduct(res.product)
      } catch (err) {
        console.error('Failed to load product:', err)
      }
      setLoading(false)
    }
    loadProduct()
  }, [productId])

  async function handleSave(data: Record<string, unknown>) {
    if (demo) return

    const { price, quantity, sku, ...productData } = data

    // Update the product record (title, description, status, etc.)
    await adminMedusa.updateProduct(productId, productData)

    // Update all variants' price and quantity
    const variants = product?.variants || []
    if (variants.length > 0) {
      for (const variant of variants) {
        const variantUpdates: Record<string, unknown> = {}
        if (price !== undefined) variantUpdates.price_amount = Math.round((price as number) / 100)
        if (quantity !== undefined) variantUpdates.inventory_quantity = quantity
        if (Object.keys(variantUpdates).length > 0) {
          await adminMedusa.updateVariant(variant.id, variantUpdates)
        }
      }
      // SKU only on the first variant
      const firstVariant = variants[0]
      if (sku !== undefined) {
        await adminMedusa.updateVariant(firstVariant.id, { sku })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f7]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#005bd3]" />
          <span className="text-[14px] font-medium text-[#616161]">Loading product...</span>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f7]">
        <p className="text-[14px] text-[#8a8a8a]">Product not found</p>
      </div>
    )
  }

  async function handleDelete() {
    if (!demo) {
      await adminMedusa.deleteProduct(productId)
    }
  }

  return (
    <ProductForm
      initialData={product}
      onSave={handleSave}
      onDelete={handleDelete}
      mode="edit"
    />
  )
}
