'use client'

import { useAdminAuth } from '@/lib/admin-auth'
import { adminMedusa } from '@/lib/admin-supabase'
import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  const { demo } = useAdminAuth()

  async function handleSave(data: Record<string, unknown>) {
    if (demo) return
    await adminMedusa.createProduct(data)
  }

  return (
    <ProductForm
      onSave={handleSave}
      mode="create"
    />
  )
}
