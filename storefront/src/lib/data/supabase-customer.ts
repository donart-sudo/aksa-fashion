// Supabase customer data layer — replaces medusa-customer.ts
// Uses Supabase client for all customer account operations

import { createClient } from '@/lib/supabase'

function getClient() {
  return createClient()
}

// --- Types ---

export interface CustomerProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at: string
}

export interface CustomerAddress {
  id: string
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  postal_code: string
  country_code: string
  phone?: string
  is_default_shipping?: boolean
}

export interface CustomerOrder {
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
    metadata?: {
      handle?: string
      size?: string
      color?: string
      product_id?: string
    }
  }[]
  shipping_address?: {
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    postal_code: string
    country_code: string
    phone?: string
  }
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

// --- Helper to get current user's customer ID ---

async function getCustomerId(): Promise<string | null> {
  const supabase = getClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', session.user.id)
    .single()

  return data?.id || null
}

// --- Profile ---

export async function getProfile(): Promise<CustomerProfile | null> {
  try {
    const supabase = getClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const { data, error } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name, phone, created_at')
      .eq('auth_user_id', session.user.id)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function updateProfile(updates: {
  first_name?: string
  last_name?: string
  phone?: string
}): Promise<CustomerProfile | null> {
  try {
    const supabase = getClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('auth_user_id', session.user.id)
      .select('id, email, first_name, last_name, phone, created_at')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to update profile:', error)
    return null
  }
}

// --- Orders ---

export async function getOrders(
  limit = 10,
  offset = 0
): Promise<{ orders: CustomerOrder[]; count: number }> {
  try {
    const customerId = await getCustomerId()
    if (!customerId) return { orders: [], count: 0 }

    const supabase = getClient()
    const { data, count, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(id, title, subtitle, thumbnail, quantity, unit_price, total, metadata)
      `, { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const orders: CustomerOrder[] = (data || []).map((o) => ({
      id: o.id,
      display_id: o.display_id,
      email: o.email,
      status: o.status,
      created_at: o.created_at,
      items: (o.order_items || []).map((item: { id: string; title: string; subtitle?: string; thumbnail?: string; quantity: number; unit_price: number; total: number; metadata?: Record<string, string> }) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        thumbnail: item.thumbnail,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        metadata: item.metadata,
      })),
      shipping_address: o.shipping_address,
      shipping_methods: o.shipping_method ? [{ name: o.shipping_method, amount: o.shipping_total }] : [],
      subtotal: o.subtotal,
      shipping_total: o.shipping_total,
      total: o.total,
      payment_status: o.payment_status,
      fulfillment_status: o.fulfillment_status,
    }))

    return { orders, count: count || 0 }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return { orders: [], count: 0 }
  }
}

export async function getOrder(id: string): Promise<CustomerOrder | null> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(id, title, subtitle, thumbnail, quantity, unit_price, total, metadata)
      `)
      .eq('id', id)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      display_id: data.display_id,
      email: data.email,
      status: data.status,
      created_at: data.created_at,
      items: (data.order_items || []).map((item: { id: string; title: string; subtitle?: string; thumbnail?: string; quantity: number; unit_price: number; total: number; metadata?: Record<string, string> }) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        thumbnail: item.thumbnail,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        metadata: item.metadata,
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

export async function getOrderCount(): Promise<number> {
  try {
    const customerId = await getCustomerId()
    if (!customerId) return 0

    const supabase = getClient()
    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)

    if (error) throw error
    return count || 0
  } catch {
    return 0
  }
}

export async function getAddressCount(): Promise<number> {
  try {
    const customerId = await getCustomerId()
    if (!customerId) return 0

    const supabase = getClient()
    const { count, error } = await supabase
      .from('customer_addresses')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)

    if (error) throw error
    return count || 0
  } catch {
    return 0
  }
}

// --- Addresses ---

export async function getAddresses(): Promise<CustomerAddress[]> {
  try {
    const customerId = await getCustomerId()
    if (!customerId) return []

    const supabase = getClient()
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default_shipping', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch addresses:', error)
    return []
  }
}

export async function createAddress(address: {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  postal_code: string
  country_code: string
  phone?: string
  is_default_shipping?: boolean
}): Promise<CustomerAddress | null> {
  try {
    const customerId = await getCustomerId()
    if (!customerId) return null

    const supabase = getClient()
    const { data, error } = await supabase
      .from('customer_addresses')
      .insert({ ...address, customer_id: customerId })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to create address:', error)
    return null
  }
}

export async function updateAddress(
  id: string,
  updates: {
    first_name?: string
    last_name?: string
    address_1?: string
    address_2?: string
    city?: string
    postal_code?: string
    country_code?: string
    phone?: string
    is_default_shipping?: boolean
  }
): Promise<CustomerAddress | null> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('customer_addresses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to update address:', error)
    return null
  }
}

export async function deleteAddress(id: string): Promise<boolean> {
  try {
    const supabase = getClient()
    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', id)

    return !error
  } catch (error) {
    console.error('Failed to delete address:', error)
    return false
  }
}
