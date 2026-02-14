const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

class MedusaAdminClient {
  private token: string | null = null
  private sessionActive = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('medusa_admin_token')
    }
  }

  private async request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    // Restore session if we have a token but no active session
    if (this.token && !this.sessionActive && !path.startsWith('/auth')) {
      await this.restoreSession()
    }

    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (res.status === 401) {
      this.logout()
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
    // Step 1: Get JWT token from auth endpoint
    const authRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!authRes.ok) {
      const body = await authRes.json().catch(() => ({}))
      throw new Error(body.message || 'Login failed')
    }
    const { token } = await authRes.json()
    this.token = token

    // Step 2: Create session cookie (required for admin API access)
    await fetch(`${BACKEND_URL}/auth/session`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    this.sessionActive = true
    localStorage.setItem('medusa_admin_token', token)
    return token
  }

  logout() {
    // Destroy session
    if (this.sessionActive) {
      fetch(`${BACKEND_URL}/auth/session`, {
        method: 'DELETE',
        credentials: 'include',
      }).catch(() => {})
    }
    this.token = null
    this.sessionActive = false
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medusa_admin_token')
    }
  }

  isAuthenticated() {
    return !!this.token
  }

  async restoreSession() {
    if (!this.token) return false
    try {
      // Re-create session from stored token
      const res = await fetch(`${BACKEND_URL}/auth/session`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      })
      this.sessionActive = res.ok
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
    return this.request<{ order: MedusaOrder }>(`/admin/orders/${id}`)
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
  created_at: string
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

export const adminMedusa = new MedusaAdminClient()
