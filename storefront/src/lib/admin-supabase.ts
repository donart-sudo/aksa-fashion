import { createClient, type SupabaseClient } from '@supabase/supabase-js'

class SupabaseAdminClient {
  private _client: SupabaseClient | null = null
  private onUnauthorized: (() => void) | null = null

  private get client(): SupabaseClient {
    if (!this._client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) throw new Error('Supabase env vars not configured')
      this._client = createClient(url, key)
    }
    return this._client
  }

  getSupabase() {
    return this.client
  }

  setOnUnauthorized(cb: () => void) {
    this.onUnauthorized = cb
  }

  /**
   * Route a database operation through the server-side API proxy,
   * which uses the service role key to bypass RLS.
   */
  private async adminQuery(body: Record<string, unknown>): Promise<{ data: unknown; count?: number | null }> {
    const { data: { session } } = await this.client.auth.getSession()
    const token = session?.access_token
    if (!token) throw new Error('Not authenticated')

    const res = await fetch('/api/admin/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`)
    return json
  }

  // ── Auth ──────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)

    // Verify user is an admin
    const { data: adminData, error: adminError } = await this.client
      .from('admin_users')
      .select('id')
      .eq('auth_user_id', data.user.id)
      .single()

    if (adminError || !adminData) {
      await this.client.auth.signOut()
      throw new Error('Not authorized as admin')
    }

    return data.session?.access_token || ''
  }

  async logout() {
    await this.client.auth.signOut()
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await this.client.auth.getSession()
    return !!session
  }

  async verifyToken(): Promise<boolean> {
    const { data: { session } } = await this.client.auth.getSession()
    if (!session) return false

    const { data } = await this.client
      .from('admin_users')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single()

    return !!data
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from('store_settings').select('id').limit(1)
      return !error
    } catch {
      return false
    }
  }

  // ── Products ──────────────────────────────────────────────────────────

  async getProducts(params?: Record<string, string>) {
    let query = this.client
      .from('products')
      .select(`
        *,
        product_images(id, url, rank),
        product_variants(id, title, price_amount, currency_code, inventory_quantity),
        product_categories(categories(id, name)),
        product_collections(collections(id, title))
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (params?.status) query = query.eq('status', params.status)
    if (params?.q) query = query.ilike('title', `%${params.q}%`)

    const limit = params?.limit ? parseInt(params.limit) : 50
    const offset = params?.offset ? parseInt(params.offset) : 0
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const products: MedusaProduct[] = (data || []).map(toAdminProduct)
    return { products, count: count || 0 }
  }

  async getProduct(id: string) {
    const { data, error } = await this.client
      .from('products')
      .select(`
        *,
        product_images(id, url, rank),
        product_options(id, title, product_option_values(id, value)),
        product_variants(id, title, sku, price_amount, currency_code, inventory_quantity, metadata),
        product_categories(categories(id, name)),
        product_collections(collections(id, title))
      `)
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return { product: toAdminProduct(data) }
  }

  async createProduct(productData: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'products',
      operation: 'insert',
      data: {
        title: productData.title as string,
        handle: productData.handle as string || slugify(productData.title as string),
        description: productData.description as string || '',
        status: (productData.status as string) || 'draft',
        thumbnail: productData.thumbnail as string || null,
        metadata: (productData.metadata as Record<string, unknown>) || {},
      },
    })

    // Create default variant if price provided
    const product = data as Record<string, unknown>
    if (productData.price !== undefined) {
      await this.adminQuery({
        table: 'product_variants',
        operation: 'insert',
        data: {
          product_id: product.id,
          title: 'Default',
          price_amount: Math.round((productData.price as number) / 100),
          currency_code: 'eur',
        },
      })
    }

    return { product: toAdminProduct(product) }
  }

  async updateProduct(id: string, updates: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'products',
      operation: 'update',
      data: {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.handle !== undefined && { handle: updates.handle }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.thumbnail !== undefined && { thumbnail: updates.thumbnail }),
        ...(updates.metadata !== undefined && { metadata: updates.metadata }),
        updated_at: new Date().toISOString(),
      },
      match: { id },
    })

    return { product: toAdminProduct(data) }
  }

  async updateVariant(variantId: string, updates: Record<string, unknown>) {
    await this.adminQuery({
      table: 'product_variants',
      operation: 'update',
      data: updates,
      match: { id: variantId },
    })
  }

  async deleteProduct(id: string) {
    await this.adminQuery({ table: 'products', operation: 'delete', match: { id } })
    return {}
  }

  // ── Orders ────────────────────────────────────────────────────────────

  async getOrders(params?: Record<string, string>) {
    // Route through server proxy to bypass RLS
    const limit = params?.limit ? parseInt(params.limit) : 50
    const match = params?.status ? { status: params.status } : undefined
    const { data, count } = await this.adminQuery({
      table: 'orders',
      operation: 'select',
      select: '*, order_items(id, title, quantity, unit_price, thumbnail, subtitle), customers(id, first_name, last_name, email)',
      match,
      order: { column: 'created_at', ascending: false },
      limit,
    })

    const orders: MedusaOrder[] = ((data as unknown[]) || []).map(toAdminOrder)
    return { orders, count: count || 0 }
  }

  async getOrder(id: string) {
    const { data } = await this.adminQuery({
      table: 'orders',
      operation: 'select_single',
      select: '*, order_items(id, title, quantity, unit_price, thumbnail, subtitle, metadata), customers(id, first_name, last_name, email)',
      match: { id },
    })

    return { order: toAdminOrder(data) }
  }

  async updateOrder(id: string, updates: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'orders',
      operation: 'update',
      data: { ...updates, updated_at: new Date().toISOString() },
      match: { id },
    })

    return { order: toAdminOrder(data) }
  }

  async completeOrder(orderId: string) {
    return this.updateOrder(orderId, { status: 'completed', fulfillment_status: 'fulfilled' })
  }

  async cancelOrder(orderId: string) {
    return this.updateOrder(orderId, { status: 'cancelled' })
  }

  // Simplified fulfillment stubs (no separate fulfillment table needed)
  async createFulfillment(orderId: string, _data: Record<string, unknown>) {
    return this.updateOrder(orderId, { fulfillment_status: 'fulfilled' })
  }

  async createShipment(orderId: string, _fulfillmentId: string, _data: Record<string, unknown>) {
    return this.updateOrder(orderId, { fulfillment_status: 'shipped' })
  }

  async markDelivered(orderId: string, _fulfillmentId: string) {
    return this.updateOrder(orderId, { fulfillment_status: 'delivered', status: 'completed' })
  }

  // ── Customers ─────────────────────────────────────────────────────────

  async getCustomers(params?: Record<string, string>) {
    let query = this.client
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (params?.q) query = query.or(`email.ilike.%${params.q}%,first_name.ilike.%${params.q}%,last_name.ilike.%${params.q}%`)

    const limit = params?.limit ? parseInt(params.limit) : 50
    const offset = params?.offset ? parseInt(params.offset) : 0
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const customers: MedusaCustomer[] = (data || []).map((c) => ({
      id: c.id,
      first_name: c.first_name || '',
      last_name: c.last_name || '',
      email: c.email,
      phone: c.phone,
      created_at: c.created_at,
    }))
    return { customers, count: count || 0 }
  }

  // ── Store ─────────────────────────────────────────────────────────────

  async getStore() {
    const { data, error } = await this.client
      .from('store_settings')
      .select('*')
      .limit(1)
      .single()

    if (error) throw new Error(error.message)
    return {
      store: {
        id: data.id,
        name: data.name,
        default_currency_code: data.default_currency_code,
        currencies: [{ code: 'eur' }, { code: 'usd' }, { code: 'gbp' }],
      } as MedusaStore,
    }
  }

  // ── Collections ──────────────────────────────────────────────────────

  async getCollections(params?: Record<string, string>) {
    let query = this.client
      .from('collections')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (params?.q) query = query.ilike('title', `%${params.q}%`)

    const limit = params?.limit ? parseInt(params.limit) : 50
    const offset = params?.offset ? parseInt(params.offset) : 0
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const collections: MedusaCollection[] = (data || []).map((c) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
      metadata: c.metadata,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))
    return { collections, count: count || 0 }
  }

  async createCollection(collectionData: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'collections',
      operation: 'insert',
      data: {
        title: collectionData.title as string,
        handle: collectionData.handle as string || slugify(collectionData.title as string),
        metadata: (collectionData.metadata as Record<string, unknown>) || {},
      },
    })
    return { collection: data as MedusaCollection }
  }

  async updateCollection(id: string, updates: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'collections',
      operation: 'update',
      data: { ...updates, updated_at: new Date().toISOString() },
      match: { id },
    })
    return { collection: data as MedusaCollection }
  }

  async deleteCollection(id: string) {
    await this.adminQuery({ table: 'collections', operation: 'delete', match: { id } })
    return {}
  }

  // ── Categories ──────────────────────────────────────────────────────

  async getCategories(params?: Record<string, string>) {
    let query = this.client
      .from('categories')
      .select('*', { count: 'exact' })
      .order('rank', { ascending: true })

    if (params?.q) query = query.ilike('name', `%${params.q}%`)

    const limit = params?.limit ? parseInt(params.limit) : 50
    const offset = params?.offset ? parseInt(params.offset) : 0
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const product_categories: MedusaCategory[] = (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      description: c.description || '',
      rank: c.rank || 0,
      parent_category_id: null,
      parent_category: null,
      category_children: [],
      metadata: null,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))
    return { product_categories, count: count || 0 }
  }

  async createCategory(categoryData: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'categories',
      operation: 'insert',
      data: {
        name: categoryData.name as string,
        handle: categoryData.handle as string || slugify(categoryData.name as string),
        description: (categoryData.description as string) || '',
        rank: (categoryData.rank as number) || 0,
      },
    })
    return { product_category: data as MedusaCategory }
  }

  async updateCategory(id: string, updates: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'categories',
      operation: 'update',
      data: { ...updates, updated_at: new Date().toISOString() },
      match: { id },
    })
    return { product_category: data as MedusaCategory }
  }

  async deleteCategory(id: string) {
    await this.adminQuery({ table: 'categories', operation: 'delete', match: { id } })
    return {}
  }

  // ── Promotions ──────────────────────────────────────────────────────

  async getPromotions(params?: Record<string, string>) {
    let query = this.client
      .from('promotions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (params?.q) query = query.ilike('code', `%${params.q}%`)

    const limit = params?.limit ? parseInt(params.limit) : 50
    const offset = params?.offset ? parseInt(params.offset) : 0
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const promotions: MedusaPromotion[] = (data || []).map((p) => ({
      id: p.id,
      code: p.code,
      type: p.type as 'standard' | 'buyget',
      is_automatic: p.is_automatic,
      status: p.status,
      campaign_id: null,
      application_method: {
        type: p.discount_type as 'fixed' | 'percentage',
        value: Number(p.discount_value),
        max_quantity: null,
        currency_code: p.currency_code,
        target_type: 'order',
      },
      rules: [],
      created_at: p.created_at,
      updated_at: p.updated_at,
    }))
    return { promotions, count: count || 0 }
  }

  async createPromotion(promoData: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'promotions',
      operation: 'insert',
      data: {
        code: promoData.code as string,
        type: (promoData.type as string) || 'standard',
        is_automatic: (promoData.is_automatic as boolean) || false,
        discount_type: (promoData.discount_type as string) || 'percentage',
        discount_value: (promoData.discount_value as number) || 0,
        currency_code: (promoData.currency_code as string) || 'eur',
        starts_at: promoData.starts_at as string || null,
        ends_at: promoData.ends_at as string || null,
      },
    })
    return { promotion: data as unknown as MedusaPromotion }
  }

  async updatePromotion(id: string, updates: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'promotions',
      operation: 'update',
      data: { ...updates, updated_at: new Date().toISOString() },
      match: { id },
    })
    return { promotion: data as unknown as MedusaPromotion }
  }

  async deletePromotion(id: string) {
    await this.adminQuery({ table: 'promotions', operation: 'delete', match: { id } })
    return {}
  }

  // ── Product Tags ───────────────────────────────────────────────────

  async getProductTags(params?: Record<string, string>) {
    let query = this.client
      .from('product_tags')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (params?.q) query = query.ilike('value', `%${params.q}%`)

    const limit = params?.limit ? parseInt(params.limit) : 50
    const offset = params?.offset ? parseInt(params.offset) : 0
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const product_tags: MedusaProductTag[] = (data || []).map((t) => ({
      id: t.id,
      value: t.value,
      metadata: t.metadata,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }))
    return { product_tags, count: count || 0 }
  }

  async createProductTag(tagData: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'product_tags',
      operation: 'insert',
      data: { value: tagData.value as string },
    })
    return { product_tag: data as MedusaProductTag }
  }

  async updateProductTag(id: string, updates: Record<string, unknown>) {
    const { data } = await this.adminQuery({
      table: 'product_tags',
      operation: 'update',
      data: { ...updates, updated_at: new Date().toISOString() },
      match: { id },
    })
    return { product_tag: data as MedusaProductTag }
  }

  async deleteProductTag(id: string) {
    await this.adminQuery({ table: 'product_tags', operation: 'delete', match: { id } })
    return {}
  }

  // ── Inventory (mapped to product_variants) ─────────────────────────

  async getStockLocations() {
    return {
      stock_locations: [{ id: 'default', name: 'Prishtina, Kosovo' }],
    }
  }

  async getInventoryItems(params?: Record<string, string>) {
    let query = this.client
      .from('product_variants')
      .select(`
        id, sku, title, price_amount, inventory_quantity,
        products(id, title)
      `, { count: 'exact' })

    if (params?.q) query = query.ilike('title', `%${params.q}%`)

    const limit = params?.limit ? parseInt(params.limit) : 50
    const offset = params?.offset ? parseInt(params.offset) : 0
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const inventory_items: InventoryItem[] = (data || []).map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      description: null,
      requires_shipping: true,
      stocked_quantity: v.inventory_quantity,
      reserved_quantity: 0,
      location_levels: [{
        id: 'default-level',
        location_id: 'default',
        stocked_quantity: v.inventory_quantity,
        reserved_quantity: 0,
        incoming_quantity: 0,
      }],
    }))
    return { inventory_items, count: count || 0 }
  }

  async updateInventoryLevel(inventoryItemId: string, _locationId: string, data: { stocked_quantity: number }) {
    await this.adminQuery({
      table: 'product_variants',
      operation: 'update',
      data: { inventory_quantity: data.stocked_quantity },
      match: { id: inventoryItemId },
    })
    return {}
  }

  // ── Store API (public products) ──────────────────────────────────────

  async getStoreProducts(params?: Record<string, string>) {
    let query = this.client
      .from('products')
      .select(`
        *,
        product_images(id, url, rank),
        product_variants(id, title, price_amount, currency_code, inventory_quantity),
        product_categories(categories(id, name)),
        product_collections(collections(id, title, handle))
      `, { count: 'exact' })
      .eq('status', 'published')

    if (params?.q) query = query.ilike('title', `%${params.q}%`)

    const limit = params?.limit ? parseInt(params.limit) : 50
    query = query.limit(limit)

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const products = (data || []).map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: null,
      description: p.description,
      handle: p.handle,
      status: p.status,
      thumbnail: p.thumbnail || p.product_images?.[0]?.url || null,
      images: (p.product_images || []).map((img: { id: string; url: string }) => ({ id: img.id, url: img.url })),
      variants: (p.product_variants || []).map((v: { id: string; title: string; price_amount: number; inventory_quantity: number }) => ({
        id: v.id,
        title: v.title,
        calculated_price: { calculated_amount: v.price_amount * 100, currency_code: 'eur' },
        inventory_quantity: v.inventory_quantity,
      })),
      collection: p.product_collections?.[0]?.collections || null,
      categories: (p.product_categories || []).map((pc: { categories: { id: string; name: string } }) => pc.categories),
      created_at: p.created_at,
      updated_at: p.updated_at,
    }))

    return { products, count: count || 0 } as { products: StoreProduct[]; count: number }
  }
}

// --- Helper functions ---

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAdminProduct(row: any): MedusaProduct {
  return {
    id: row.id,
    title: row.title,
    subtitle: null,
    description: row.description,
    handle: row.handle,
    status: row.status,
    thumbnail: row.thumbnail || row.product_images?.[0]?.url || null,
    images: (row.product_images || []).map((img: { id: string; url: string }) => ({ id: img.id, url: img.url })),
    variants: (row.product_variants || []).map((v: { id: string; title: string; sku?: string | null; price_amount: number; currency_code: string; inventory_quantity: number }) => ({
      id: v.id,
      title: v.title,
      sku: v.sku || null,
      prices: [{ amount: v.price_amount * 100, currency_code: v.currency_code || 'eur' }],
      inventory_quantity: v.inventory_quantity,
    })),
    collection: row.product_collections?.[0]?.collections
      ? { id: row.product_collections[0].collections.id, title: row.product_collections[0].collections.title }
      : null,
    categories: (row.product_categories || []).map((pc: { categories: { id: string; name: string } }) => ({
      id: pc.categories?.id || '',
      name: pc.categories?.name || '',
    })),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAdminOrder(row: any): MedusaOrder {
  return {
    id: row.id,
    display_id: row.display_id,
    status: row.status,
    fulfillment_status: row.fulfillment_status || 'not_fulfilled',
    payment_status: row.payment_status || 'awaiting',
    total: (row.total || 0) * 100,
    subtotal: (row.subtotal || 0) * 100,
    tax_total: 0,
    currency_code: row.currency_code || 'eur',
    items: (row.order_items || []).map((item: { id: string; title: string; quantity: number; unit_price: number; thumbnail: string | null }) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: (item.unit_price || 0) * 100,
      thumbnail: item.thumbnail,
    })),
    customer: row.customers
      ? {
          id: row.customers.id,
          first_name: row.customers.first_name,
          last_name: row.customers.last_name,
          email: row.customers.email,
        }
      : null,
    shipping_address: row.shipping_address,
    fulfillments: [],
    metadata: row.metadata,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// ── Types (same shape as admin-medusa.ts) ──────────────────────────────────

export interface MedusaProduct {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string
  status: 'draft' | 'published' | 'proposed' | 'rejected'
  thumbnail: string | null
  images: { id: string; url: string }[]
  variants: { id: string; title: string; sku?: string | null; prices: { amount: number; currency_code: string }[]; inventory_quantity: number }[]
  collection: { id: string; title: string } | null
  categories: { id: string; name: string }[]
  created_at: string
  updated_at: string
}

export interface MedusaOrder {
  id: string
  display_id: number
  status: string
  fulfillment_status: string
  payment_status: string
  total: number
  subtotal: number
  tax_total: number
  currency_code: string
  items: { id: string; title: string; quantity: number; unit_price: number; thumbnail: string | null }[]
  customer: { id: string; first_name: string; last_name: string; email: string } | null
  shipping_address: { address_1: string; city: string; country_code: string } | null
  fulfillments?: { id: string; packed_at: string | null; shipped_at: string | null; delivered_at: string | null; canceled_at: string | null; labels?: { tracking_number: string; tracking_url: string }[] }[]
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface MedusaCustomer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  created_at: string
  orders?: MedusaOrder[]
}

export interface MedusaStore {
  id: string
  name: string
  default_currency_code: string
  currencies: { code: string }[]
}

export interface StoreProduct {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string
  status: string
  thumbnail: string | null
  images: { id: string; url: string }[]
  variants: { id: string; title: string; calculated_price?: { calculated_amount: number; currency_code: string }; inventory_quantity?: number }[]
  collection: { id: string; title: string; handle: string } | null
  categories: { id: string; name: string }[]
  created_at: string
  updated_at: string
}

export interface MedusaCollection {
  id: string
  title: string
  handle: string
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface MedusaCategory {
  id: string
  name: string
  handle: string
  description: string
  rank: number
  parent_category_id: string | null
  parent_category: MedusaCategory | null
  category_children: MedusaCategory[]
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface MedusaPromotion {
  id: string
  code: string
  type: 'standard' | 'buyget'
  is_automatic: boolean
  status: string
  campaign_id: string | null
  application_method: {
    type: 'fixed' | 'percentage'
    value: number
    max_quantity: number | null
    currency_code: string | null
    target_type: string
  } | null
  rules: { attribute: string; operator: string; values: string[] }[]
  created_at: string
  updated_at: string
}

export interface MedusaProductTag {
  id: string
  value: string
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  sku: string | null
  title: string | null
  description: string | null
  requires_shipping: boolean
  stocked_quantity?: number
  reserved_quantity?: number
  location_levels?: { id: string; location_id: string; stocked_quantity: number; reserved_quantity: number; incoming_quantity: number }[]
}

export const adminMedusa = new SupabaseAdminClient()
