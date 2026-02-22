// Server-side wishlist persistence for logged-in customers
import { createClient } from '@/lib/supabase'
import type { WishlistItem } from '@/lib/wishlist'

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

export async function getServerWishlist(): Promise<WishlistItem[]> {
  try {
    return await withTimeout(async function() {
      const customerId = await getCustomerId()
      if (!customerId) return []

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_wishlists')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return (data || []).map((row) => ({
        id: row.product_id,
        title: row.title,
        handle: row.handle,
        price: row.price,
        originalPrice: row.original_price || undefined,
        thumbnail: row.thumbnail || '',
        hoverImage: row.hover_image || undefined,
        badge: row.badge as WishlistItem['badge'],
      }))
    }())
  } catch (error) {
    console.warn('Failed to fetch server wishlist:', error)
    return []
  }
}

export async function syncWishlistToServer(items: WishlistItem[]): Promise<void> {
  try {
    await withTimeout(async function() {
      const customerId = await getCustomerId()
      if (!customerId) return

      const supabase = createClient()

      // Delete all existing wishlist items for this customer
      await supabase
        .from('customer_wishlists')
        .delete()
        .eq('customer_id', customerId)

      if (items.length === 0) return

      // Insert current wishlist items
      const rows = items.map((item) => ({
        customer_id: customerId,
        product_id: item.id,
        title: item.title,
        handle: item.handle,
        price: item.price,
        original_price: item.originalPrice || null,
        thumbnail: item.thumbnail,
        hover_image: item.hoverImage || null,
        badge: item.badge || null,
      }))

      const { error } = await supabase
        .from('customer_wishlists')
        .insert(rows)

      if (error) throw error
    }())
  } catch (error) {
    console.warn('Failed to sync wishlist to server:', error)
  }
}
