// Supabase checkout helpers — replaces medusa-checkout.ts
// Cart lives in localStorage, orders are created via /api/checkout

// --- Types ---

export interface MedusaAddress {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  province?: string
  postal_code: string
  country_code: string
  phone?: string
}

export interface MedusaShippingOption {
  id: string
  name: string
  amount: number
  is_tax_inclusive: boolean
  estimated_days?: string
  calculated_price?: {
    calculated_amount: number
  }
}

export interface MedusaOrder {
  id: string
  display_id: number
  email: string
  status: string
  created_at: string
  items: {
    id: string
    title: string
    subtitle?: string
    thumbnail?: string
    quantity: number
    unit_price: number
    total: number
    variant?: {
      title: string
      options?: { value: string }[]
    }
  }[]
  shipping_address?: MedusaAddress
  shipping_methods?: {
    name?: string
    amount: number
  }[]
  subtotal: number
  shipping_total: number
  total: number
  payment_status?: string
  fulfillment_status?: string
}

// --- Country code resolver ---

const COUNTRY_MAP: Record<string, string> = {
  kosovo: 'xk',
  albania: 'al',
  'north macedonia': 'mk',
  montenegro: 'me',
  serbia: 'rs',
  germany: 'de',
  austria: 'at',
  france: 'fr',
  italy: 'it',
  'united kingdom': 'gb',
  uk: 'gb',
  switzerland: 'ch',
  netherlands: 'nl',
  belgium: 'be',
  'united states': 'us',
  usa: 'us',
  australia: 'au',
  'bosnia and herzegovina': 'ba',
  brazil: 'br',
  bulgaria: 'bg',
  canada: 'ca',
  croatia: 'hr',
  'czech republic': 'cz',
  denmark: 'dk',
  greece: 'gr',
  hungary: 'hu',
  ireland: 'ie',
  norway: 'no',
  poland: 'pl',
  portugal: 'pt',
  romania: 'ro',
  spain: 'es',
  sweden: 'se',
  turkey: 'tr',
  'united arab emirates': 'ae',
}

export function resolveCountryCode(countryName: string): string {
  const lower = countryName.toLowerCase().trim()
  // Already a 2-letter code — return as-is
  if (lower.length === 2) return lower
  return COUNTRY_MAP[lower] || 'xk'
}

// --- Shipping Options (via server API route — avoids browser client issues) ---

const FALLBACK_SHIPPING: MedusaShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    amount: 1500,
    is_tax_inclusive: true,
    estimated_days: '3-5 business days',
    calculated_price: { calculated_amount: 1500 },
  },
  {
    id: 'express',
    name: 'Express Shipping',
    amount: 3000,
    is_tax_inclusive: true,
    estimated_days: '1-2 business days',
    calculated_price: { calculated_amount: 3000 },
  },
]

export async function getShippingOptions(subtotal: number): Promise<MedusaShippingOption[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(`/api/checkout/shipping?subtotal=${subtotal}`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) throw new Error('API error')

    const data = await res.json()
    const options = data.options as MedusaShippingOption[]

    if (options && options.length > 0) return options

    // API returned empty — use fallback
    return FALLBACK_SHIPPING.map(opt => ({
      ...opt,
      amount: subtotal >= 15000 ? 0 : opt.amount,
      calculated_price: { calculated_amount: subtotal >= 15000 ? 0 : opt.amount },
    }))
  } catch {
    // Network error, timeout, or any failure — use fallback
    return FALLBACK_SHIPPING.map(opt => ({
      ...opt,
      amount: subtotal >= 15000 ? 0 : opt.amount,
      calculated_price: { calculated_amount: subtotal >= 15000 ? 0 : opt.amount },
    }))
  }
}

// --- Place Order (calls server API route) ---

export interface CheckoutPayload {
  email: string
  items: {
    productId: string
    handle: string
    title: string
    thumbnail: string
    quantity: number
    price: number
    size?: string
    color?: string
  }[]
  shippingAddress: MedusaAddress
  shippingOptionId: string
  shippingCost: number
  orderNote?: string
}

export async function placeOrder(payload: CheckoutPayload): Promise<MedusaOrder | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to place order')
    }

    const data = await res.json()
    return data.order
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Order request timed out after 30 seconds')
    } else {
      console.error('Failed to place order:', error)
    }
    return null
  }
}

// --- Fetch Order (for confirmation page) ---
// Uses server API route to bypass RLS (guest orders have no auth context)

export async function getOrder(orderId: string): Promise<MedusaOrder | null> {
  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.order || null
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return null
  }
}
