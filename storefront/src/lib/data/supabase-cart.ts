// Server-side cart persistence for logged-in customers
import { createClient } from '@/lib/supabase'
import type { CartItem } from '@/lib/cart'

const TIMEOUT = 5000

function withTimeout<T>(promise: Promise<T>, ms = TIMEOUT): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ])
}

async function getCustomerId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', session.user.id)
    .single()

  return data?.id || null
}

export async function getServerCart(): Promise<CartItem[]> {
  try {
    return await withTimeout(async function() {
      const customerId = await getCustomerId()
      if (!customerId) return []

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_carts')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return (data || []).map((row) => ({
        id: `cart_${row.id}`,
        productId: row.product_id,
        variantId: row.variant_id,
        handle: row.handle,
        title: row.title,
        thumbnail: row.thumbnail || '',
        price: row.price,
        quantity: row.quantity,
        size: row.size || undefined,
        color: row.color || undefined,
      }))
    }())
  } catch (error) {
    console.warn('Failed to fetch server cart:', error)
    return []
  }
}

export async function syncCartToServer(items: CartItem[]): Promise<void> {
  try {
    await withTimeout(async function() {
      const customerId = await getCustomerId()
      if (!customerId) return

      const supabase = createClient()

      // Delete all existing cart items for this customer
      await supabase
        .from('customer_carts')
        .delete()
        .eq('customer_id', customerId)

      if (items.length === 0) return

      // Insert current cart items
      const rows = items.map((item) => ({
        customer_id: customerId,
        product_id: item.productId,
        variant_id: item.variantId,
        handle: item.handle,
        title: item.title,
        thumbnail: item.thumbnail,
        price: item.price,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      }))

      const { error } = await supabase
        .from('customer_carts')
        .insert(rows)

      if (error) throw error
    }())
  } catch (error) {
    console.warn('Failed to sync cart to server:', error)
  }
}

export async function clearServerCart(): Promise<void> {
  try {
    await withTimeout(async function() {
      const customerId = await getCustomerId()
      if (!customerId) return

      const supabase = createClient()
      await supabase
        .from('customer_carts')
        .delete()
        .eq('customer_id', customerId)
    }())
  } catch (error) {
    console.warn('Failed to clear server cart:', error)
  }
}
