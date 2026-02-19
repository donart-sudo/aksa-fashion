// Supabase checkout helpers — replaces medusa-checkout.ts
// Cart lives in localStorage, orders are created via /api/checkout

import { createClient } from '@supabase/supabase-js'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

// --- Types ---

export interface MedusaAddress {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
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
}

export function resolveCountryCode(countryName: string): string {
  const lower = countryName.toLowerCase().trim()
  if (lower.length === 2) return lower
  return COUNTRY_MAP[lower] || 'xk'
}

// --- Shipping Options ---

export async function getShippingOptions(subtotal: number): Promise<MedusaShippingOption[]> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('shipping_options')
      .select('*')
      .order('amount', { ascending: true })

    if (error) throw error

    return (data || []).map((opt) => {
      // Free shipping if subtotal >= threshold (€150 = 15000 cents)
      const isFree = opt.name === 'Free Shipping' && subtotal >= 15000
      const isStandard = opt.name === 'Standard Shipping' && subtotal >= 15000

      return {
        id: opt.id,
        name: opt.name,
        amount: isFree || isStandard ? 0 : opt.amount,
        is_tax_inclusive: true,
        estimated_days: opt.estimated_days,
        calculated_price: {
          calculated_amount: isFree || isStandard ? 0 : opt.amount,
        },
      }
    }).filter((opt) => {
      // Only show free shipping if eligible
      if (opt.name === 'Free Shipping' && subtotal < 15000) return false
      // Don't show standard if free is available (subtotal >= threshold)
      if (opt.name === 'Standard Shipping' && subtotal >= 15000) return false
      return true
    })
  } catch (error) {
    console.error('Failed to fetch shipping options:', error)
    // Fallback
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        amount: subtotal >= 15000 ? 0 : 1500,
        is_tax_inclusive: true,
        estimated_days: '3-5 business days',
        calculated_price: { calculated_amount: subtotal >= 15000 ? 0 : 1500 },
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
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to place order')
    }

    const data = await res.json()
    return data.order
  } catch (error) {
    console.error('Failed to place order:', error)
    return null
  }
}

// --- Fetch Order (for confirmation page) ---

export async function getOrder(orderId: string): Promise<MedusaOrder | null> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(id, title, subtitle, thumbnail, quantity, unit_price, total, metadata)
      `)
      .eq('id', orderId)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      display_id: data.display_id,
      email: data.email,
      status: data.status,
      created_at: data.created_at,
      items: (data.order_items || []).map((item: { id: string; title: string; subtitle?: string; thumbnail?: string; quantity: number; unit_price: number; total: number }) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        thumbnail: item.thumbnail,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      })),
      shipping_address: data.shipping_address,
      shipping_methods: data.shipping_method ? [{ name: data.shipping_method, amount: data.shipping_total }] : [],
      subtotal: data.subtotal,
      shipping_total: data.shipping_total,
      total: data.total,
      payment_status: data.payment_status,
      fulfillment_status: data.fulfillment_status,
    }
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return null
  }
}
