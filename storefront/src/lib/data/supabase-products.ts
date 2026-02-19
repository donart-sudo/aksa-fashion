// Supabase product data fetching layer
// Replaces medusa-products.ts — same function signatures and output shapes

import { createClient } from '@supabase/supabase-js'
import type { ScrapedProduct } from './products'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

// --- Card format type ---

export interface ProductCardData {
  id: string
  title: string
  handle: string
  price: number
  originalPrice?: number
  thumbnail: string
  hoverImage?: string
  badge?: 'new' | 'sale' | 'bestseller'
  colors?: string[]
  sizes?: string[]
  collection?: string
}

// --- Transform DB row → ScrapedProduct ---

interface DbProduct {
  id: string
  title: string
  handle: string
  description: string | null
  status: string
  thumbnail: string | null
  metadata: Record<string, string> | null
  created_at: string
  product_images?: { url: string; rank: number }[]
  product_options?: { title: string; product_option_values: { value: string }[] }[]
  product_variants?: { id: string; title: string; price_amount: number; currency_code: string; inventory_quantity: number }[]
  product_categories?: { categories: { name: string; handle: string } }[]
  product_collections?: { collections: { title: string; handle: string } }[]
}

function toScrapedProduct(p: DbProduct): ScrapedProduct {
  const firstVariant = p.product_variants?.[0]
  const price = firstVariant?.price_amount ?? 0

  const regularPrice = p.metadata?.regular_price
    ? Number(p.metadata.regular_price)
    : price
  const salePrice = p.metadata?.sale_price
    ? Number(p.metadata.sale_price)
    : undefined

  const sizeOption = p.product_options?.find(
    (o) => o.title.toLowerCase() === 'size'
  )
  const colorOption = p.product_options?.find(
    (o) => o.title.toLowerCase() === 'color'
  )

  const sizes = sizeOption
    ? sizeOption.product_option_values.map((v) => v.value)
    : []

  let colors: string[] = []
  if (colorOption && colorOption.product_option_values.length > 0) {
    colors = colorOption.product_option_values.map((v) => v.value)
  } else if (p.metadata?.colors) {
    try {
      colors = JSON.parse(p.metadata.colors)
    } catch {
      colors = []
    }
  }

  const images = (p.product_images || [])
    .sort((a, b) => a.rank - b.rank)
    .map((img) => img.url)

  if (images.length === 0 && p.thumbnail) {
    images.push(p.thumbnail)
  }

  const categoryNames = (p.product_categories || []).map(
    (pc) => pc.categories?.name || ''
  ).filter(Boolean)

  const collection = p.product_collections?.[0]?.collections?.title

  const inStock = p.metadata?.in_stock !== 'false'

  return {
    id: hashId(p.id),
    name: p.title,
    slug: p.handle,
    price: salePrice ?? price,
    regularPrice,
    salePrice,
    description: p.description || '',
    images,
    categories: categoryNames,
    colors,
    sizes,
    inStock,
    collection,
  }
}

function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

// --- Transform ScrapedProduct → ProductCardData ---

function toCardFormat(p: ScrapedProduct): ProductCardData {
  const isNew = p.id > 5000
  return {
    id: String(p.id),
    title: p.name,
    handle: p.slug,
    price: p.salePrice ? p.salePrice * 100 : p.price * 100,
    originalPrice: p.salePrice ? p.regularPrice * 100 : undefined,
    thumbnail: p.images[0] || '',
    hoverImage: p.images[1],
    badge: p.salePrice ? 'sale' : isNew ? 'new' : undefined,
    colors: p.colors.length > 0 ? p.colors : undefined,
    sizes: p.sizes.length > 0 ? p.sizes : undefined,
    collection: p.collection || (p.categories.length > 0 ? p.categories[0] : undefined),
  }
}

// --- Supabase query with all relations ---

const PRODUCT_SELECT = `
  *,
  product_images(url, rank),
  product_options(title, product_option_values(value)),
  product_variants(id, title, price_amount, currency_code, inventory_quantity),
  product_categories(categories(name, handle)),
  product_collections(collections(title, handle))
`

// --- Public API functions ---

export async function fetchProducts(params?: {
  limit?: number
  offset?: number
  category_id?: string[]
  order?: string
}): Promise<{ products: ScrapedProduct[]; count: number }> {
  try {
    const supabase = getClient()
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT, { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(params?.offset || 0, (params?.offset || 0) + (params?.limit || 100) - 1)

    if (params?.category_id && params.category_id.length > 0) {
      query = query.in(
        'id',
        // subquery: get product IDs for these categories
        params.category_id
      )
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      products: (data || []).map(toScrapedProduct),
      count: count || 0,
    }
  } catch (error) {
    console.error('Failed to fetch products from Supabase:', error)
    const { products } = await import('./products')
    return { products, count: products.length }
  }
}

export async function fetchProduct(
  handle: string
): Promise<ScrapedProduct | null> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('handle', handle)
      .eq('status', 'published')
      .single()

    if (error || !data) return null
    return toScrapedProduct(data)
  } catch (error) {
    console.error(`Failed to fetch product ${handle}:`, error)
    const { getProductBySlug } = await import('./products')
    return getProductBySlug(handle)
  }
}

export async function fetchProductHandles(): Promise<string[]> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('products')
      .select('handle')
      .eq('status', 'published')
      .limit(200)

    if (error) throw error
    return (data || []).map((p) => p.handle)
  } catch (error) {
    console.error('Failed to fetch product handles:', error)
    const { products } = await import('./products')
    return products.map((p) => p.slug)
  }
}

export async function fetchCategories(): Promise<
  { handle: string; title: string; id: string }[]
> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, handle')
      .order('rank', { ascending: true })
      .limit(50)

    if (error) throw error
    return (data || []).map((c) => ({
      id: c.id,
      handle: c.handle,
      title: c.name,
    }))
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    const { categories } = await import('./products')
    return categories.map((c) => ({ ...c, id: '' }))
  }
}

export async function fetchProductsByCategory(
  categoryHandle: string
): Promise<ScrapedProduct[]> {
  try {
    const supabase = getClient()

    // Get category ID from handle
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('handle', categoryHandle)
      .single()

    if (catError || !catData) return []

    // Get product IDs in this category
    const { data: pcData, error: pcError } = await supabase
      .from('product_categories')
      .select('product_id')
      .eq('category_id', catData.id)

    if (pcError || !pcData || pcData.length === 0) return []

    const productIds = pcData.map((pc) => pc.product_id)

    // Get full products
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .in('id', productIds)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(toScrapedProduct)
  } catch (error) {
    console.error(`Failed to fetch products for category ${categoryHandle}:`, error)
    const { getProductsByCategory, products } = await import('./products')
    const cardProducts = getProductsByCategory(categoryHandle)
    return cardProducts.map((p) => {
      return products.find(
        (prod: ScrapedProduct) => prod.slug === p.handle
      ) as ScrapedProduct
    }).filter(Boolean)
  }
}

export async function fetchNewProducts(
  limit?: number
): Promise<ScrapedProduct[]> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit || 20)

    if (error) throw error
    return (data || []).map(toScrapedProduct)
  } catch (error) {
    console.error('Failed to fetch new products:', error)
    const { products } = await import('./products')
    return products.filter((p) => p.id > 5200).slice(0, limit || 20)
  }
}

export async function fetchSaleProducts(): Promise<ScrapedProduct[]> {
  const { products } = await fetchProducts({ limit: 100 })
  return products.filter((p) => p.salePrice !== undefined)
}

// --- Card format helpers ---

export async function fetchProductsForCards(
  limit?: number
): Promise<ProductCardData[]> {
  const { products } = await fetchProducts({
    limit: limit || 100,
  })
  return products.map(toCardFormat)
}

export async function fetchNewProductsForCards(
  limit?: number
): Promise<ProductCardData[]> {
  const products = await fetchNewProducts(limit)
  return products.map(toCardFormat)
}

export async function fetchSaleProductsForCards(): Promise<ProductCardData[]> {
  const products = await fetchSaleProducts()
  return products.map(toCardFormat)
}

export async function fetchProductsByCategoryForCards(
  categoryHandle: string
): Promise<ProductCardData[]> {
  const products = await fetchProductsByCategory(categoryHandle)
  return products.map(toCardFormat)
}

// --- Search ---

export async function searchProducts(
  query: string,
  limit = 12
): Promise<ProductCardData[]> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase.rpc('search_products', {
      search_query: query,
      result_limit: limit,
    })

    if (error) throw error
    if (!data || data.length === 0) {
      // Fallback: simple ILIKE search
      const { data: fallbackData } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('status', 'published')
        .ilike('title', `%${query}%`)
        .limit(limit)

      return (fallbackData || []).map(toScrapedProduct).map(toCardFormat)
    }

    // The RPC only returns base product columns — fetch full data
    const productIds = data.map((p: { id: string }) => p.id)
    const { data: fullData } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .in('id', productIds)

    return (fullData || []).map(toScrapedProduct).map(toCardFormat)
  } catch (error) {
    console.error('Failed to search products:', error)
    const { products } = await import('./products')
    return products
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)
      .map(toCardFormat)
  }
}

// --- Category cover image helper ---

export async function fetchCategoryCover(
  categoryHandle: string
): Promise<string> {
  const products = await fetchProductsByCategory(categoryHandle)
  return products[0]?.images[0] || ''
}
