const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

class MedusaAdminClient {
  private token: string | null = null
  private onUnauthorized: (() => void) | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('medusa_admin_token')
    }
  }

  setOnUnauthorized(cb: () => void) {
    this.onUnauthorized = cb
  }

  private async request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    // Use Bearer token for all authenticated requests
    if (this.token && !path.startsWith('/auth')) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers,
    })

    if (res.status === 401) {
      this.token = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('medusa_admin_token')
        localStorage.removeItem('medusa_admin_email')
      }
      if (this.onUnauthorized) this.onUnauthorized()
      throw new Error('Session expired')
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || `Request failed: ${res.status}`)
    }
    if (res.status === 204) return {} as T
    return res.json()
  }

  // ── Auth ──────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const authRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!authRes.ok) {
      const body = await authRes.json().catch(() => ({}))
      throw new Error(body.message || 'Invalid email or password')
    }
    const { token } = await authRes.json()
    this.token = token
    localStorage.setItem('medusa_admin_token', token)
    return token
  }

  logout() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medusa_admin_token')
      localStorage.removeItem('medusa_admin_email')
    }
  }

  isAuthenticated() {
    return !!this.token
  }

  getToken() {
    return this.token
  }

  async verifyToken(): Promise<boolean> {
    if (!this.token) return false
    try {
      // Try a lightweight admin request to verify the token works
      const res = await fetch(`${BACKEND_URL}/admin/store`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      return res.ok
    } catch {
      return false
    }
  }

  // ── Health ────────────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(3000) })
      return true
    } catch {
      return false
    }
  }

  // ── Products ──────────────────────────────────────────────────────────

  async getProducts(params?: Record<string, string>) {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ products: MedusaProduct[]; count: number }>(`/admin/products${q}`)
  }

  async getProduct(id: string) {
    return this.request<{ product: MedusaProduct }>(`/admin/products/${id}`)
  }

  async createProduct(data: Record<string, unknown>) {
    return this.request<{ product: MedusaProduct }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: Record<string, unknown>) {
    return this.request<{ product: MedusaProduct }>(`/admin/products/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string) {
    return this.request(`/admin/products/${id}`, { method: 'DELETE' })
  }

  // ── Orders ────────────────────────────────────────────────────────────

  async getOrders(params?: Record<string, string>) {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ orders: MedusaOrder[]; count: number }>(`/admin/orders${q}`)
  }

  async getOrder(id: string) {
    return this.request<{ order: MedusaOrder }>(`/admin/orders/${id}?fields=*fulfillments,*fulfillments.labels`)
  }

  async updateOrder(id: string, data: Record<string, unknown>) {
    return this.request<{ order: MedusaOrder }>(`/admin/orders/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createFulfillment(orderId: string, data: { items: { id: string; quantity: number }[]; location_id?: string; no_notification?: boolean; metadata?: Record<string, unknown> }) {
    return this.request<{ order: MedusaOrder }>(`/admin/orders/${orderId}/fulfillments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createShipment(orderId: string, fulfillmentId: string, data: { items: { id: string; quantity: number }[]; labels?: { tracking_number: string; tracking_url?: string }[]; no_notification?: boolean }) {
    return this.request<{ order: MedusaOrder }>(`/admin/orders/${orderId}/fulfillments/${fulfillmentId}/shipments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async markDelivered(orderId: string, fulfillmentId: string) {
    return this.request<{ order: MedusaOrder }>(`/admin/orders/${orderId}/fulfillments/${fulfillmentId}/mark-as-delivered`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async completeOrder(orderId: string) {
    return this.request<{ order: MedusaOrder }>(`/admin/orders/${orderId}/complete`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async cancelOrder(orderId: string) {
    return this.request<{ order: MedusaOrder }>(`/admin/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  // ── Customers ─────────────────────────────────────────────────────────

  async getCustomers(params?: Record<string, string>) {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ customers: MedusaCustomer[]; count: number }>(`/admin/customers${q}`)
  }

  // ── Store ─────────────────────────────────────────────────────────────

  async getStore() {
    return this.request<{ store: MedusaStore }>('/admin/store')
  }

  // ── Collections ──────────────────────────────────────────────────────

  async getCollections(params?: Record<string, string>) {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ collections: MedusaCollection[]; count: number }>(`/admin/collections${q}`)
  }

  async createCollection(data: Record<string, unknown>) {
    return this.request<{ collection: MedusaCollection }>('/admin/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCollection(id: string, data: Record<string, unknown>) {
    return this.request<{ collection: MedusaCollection }>(`/admin/collections/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteCollection(id: string) {
    return this.request(`/admin/collections/${id}`, { method: 'DELETE' })
  }

  // ── Categories ──────────────────────────────────────────────────────

  async getCategories(params?: Record<string, string>) {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ product_categories: MedusaCategory[]; count: number }>(`/admin/product-categories${q}`)
  }

  async createCategory(data: Record<string, unknown>) {
    return this.request<{ product_category: MedusaCategory }>('/admin/product-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCategory(id: string, data: Record<string, unknown>) {
    return this.request<{ product_category: MedusaCategory }>(`/admin/product-categories/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteCategory(id: string) {
    return this.request(`/admin/product-categories/${id}`, { method: 'DELETE' })
  }

  // ── Promotions (Discounts) ──────────────────────────────────────────

  async getPromotions(params?: Record<string, string>) {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ promotions: MedusaPromotion[]; count: number }>(`/admin/promotions${q}`)
  }

  async createPromotion(data: Record<string, unknown>) {
    return this.request<{ promotion: MedusaPromotion }>('/admin/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePromotion(id: string, data: Record<string, unknown>) {
    return this.request<{ promotion: MedusaPromotion }>(`/admin/promotions/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deletePromotion(id: string) {
    return this.request(`/admin/promotions/${id}`, { method: 'DELETE' })
  }

  // ── Product Tags ───────────────────────────────────────────────────

  async getProductTags(params?: Record<string, string>) {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ product_tags: MedusaProductTag[]; count: number }>(`/admin/product-tags${q}`)
  }

  async createProductTag(data: Record<string, unknown>) {
    return this.request<{ product_tag: MedusaProductTag }>('/admin/product-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProductTag(id: string, data: Record<string, unknown>) {
    return this.request<{ product_tag: MedusaProductTag }>(`/admin/product-tags/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteProductTag(id: string) {
    return this.request(`/admin/product-tags/${id}`, { method: 'DELETE' })
  }

  // ── Inventory ──────────────────────────────────────────────────────

  async getStockLocations() {
    return this.request<{ stock_locations: { id: string; name: string }[] }>('/admin/stock-locations')
  }

  async getInventoryItems(params?: Record<string, string>) {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ inventory_items: InventoryItem[]; count: number }>(`/admin/inventory-items${q}`)
  }

  async updateInventoryLevel(inventoryItemId: string, locationId: string, data: { stocked_quantity: number }) {
    return this.request(`/admin/inventory-items/${inventoryItemId}/location-levels/${locationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ── Store API (public, no auth needed) ──────────────────────────────

  async getStoreProducts(params?: Record<string, string>) {
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
    // First get region for pricing context
    let regionId = params?.region_id || ''
    if (!regionId) {
      try {
        const regionRes = await fetch(`${BACKEND_URL}/store/regions`, {
          headers: { 'x-publishable-api-key': publishableKey },
        })
        if (regionRes.ok) {
          const regionData = await regionRes.json()
          regionId = regionData.regions?.[0]?.id || ''
        }
      } catch { /* proceed without region */ }
    }

    const allParams: Record<string, string> = {
      ...params,
      fields: '+variants.calculated_price',
    }
    if (regionId) allParams.region_id = regionId

    const q = '?' + new URLSearchParams(allParams).toString()
    const res = await fetch(`${BACKEND_URL}/store/products${q}`, {
      headers: {
        'x-publishable-api-key': publishableKey,
      },
    })
    if (!res.ok) throw new Error(`Store API error: ${res.status}`)
    return res.json() as Promise<{ products: StoreProduct[]; count: number }>
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface MedusaProduct {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string
  status: 'draft' | 'published' | 'proposed' | 'rejected'
  thumbnail: string | null
  images: { id: string; url: string }[]
  variants: { id: string; title: string; prices: { amount: number; currency_code: string }[]; inventory_quantity: number }[]
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

export const adminMedusa = new MedusaAdminClient()
