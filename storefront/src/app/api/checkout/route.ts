import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendOrderConfirmationEmail } from '@/lib/email'

// UUID v4 regex for validating product IDs from Supabase
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Shipping costs in cents — single source of truth
const STANDARD_SHIPPING = 1500  // €15
const EXPRESS_SHIPPING = 3000   // €30
const FREE_SHIPPING_THRESHOLD = 15000 // €150

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, items, shippingAddress, shippingOptionId, orderNote } = body

    // Validate required fields
    if (!email || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Normalize email to lowercase (prevents case-sensitivity mismatch on lookup)
    const normalizedEmail = email.toLowerCase().trim()

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.first_name || !shippingAddress.last_name ||
        !shippingAddress.address_1 || !shippingAddress.city || !shippingAddress.postal_code ||
        !shippingAddress.country_code) {
      return NextResponse.json({ error: 'Incomplete shipping address' }, { status: 400 })
    }

    // Validate order note length
    const sanitizedNote = typeof orderNote === 'string' ? orderNote.slice(0, 500) : ''

    const supabase = createAdminClient()

    // Server-side price verification: look up actual prices from database
    // Products may have UUID IDs (from Supabase) or numeric IDs (static fallback)
    const uuidProductIds = items
      .map((item: { productId: string }) => item.productId)
      .filter((id: string) => UUID_REGEX.test(id))

    let productPriceMap: Record<string, number> = {}
    if (uuidProductIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, product_variants(price_amount)')
        .in('id', uuidProductIds)

      if (products) {
        for (const product of products) {
          const variants = product.product_variants as { price_amount: number }[]
          if (variants && variants.length > 0) {
            // price_amount is in whole EUR in db, cart items are in cents
            productPriceMap[product.id] = variants[0].price_amount * 100
          }
        }
      }
    }

    // Calculate totals server-side
    // For UUID products: use verified DB price (prevents manipulation)
    // For static/fallback products: use client price (no DB record to verify against)
    let subtotal = 0
    const orderItems = items.map((item: {
      productId: string
      handle: string
      title: string
      thumbnail: string
      quantity: number
      price: number
      size?: string
      color?: string
    }) => {
      const isUUID = UUID_REGEX.test(item.productId)
      const verifiedPrice = isUUID && productPriceMap[item.productId]
        ? productPriceMap[item.productId]
        : item.price

      // Validate quantity
      const quantity = Math.max(1, Math.min(item.quantity, 10))
      const itemTotal = verifiedPrice * quantity
      subtotal += itemTotal

      // Only set product_id if it's a valid UUID (from Supabase)
      const productId = isUUID ? item.productId : null

      return {
        product_id: productId,
        title: item.title,
        subtitle: [item.color, item.size].filter(Boolean).join(' / ') || null,
        thumbnail: item.thumbnail,
        quantity,
        unit_price: verifiedPrice,
        total: itemTotal,
        metadata: {
          handle: item.handle,
          product_id_raw: item.productId,
          size: item.size || null,
          color: item.color || null,
        },
      }
    })

    // Server-side shipping cost verification — never trust client value
    let shippingTotal = 0
    let shippingMethodName = 'Standard Shipping'

    if (shippingOptionId && shippingOptionId !== 'standard' && shippingOptionId !== 'express') {
      // Real shipping option from database
      const { data: shippingOpt } = await supabase
        .from('shipping_options')
        .select('name, amount')
        .eq('id', shippingOptionId)
        .single()
      if (shippingOpt) {
        shippingMethodName = shippingOpt.name
        // Apply free shipping threshold
        if (subtotal >= FREE_SHIPPING_THRESHOLD && (shippingOpt.name === 'Standard Shipping' || shippingOpt.name === 'Free Shipping')) {
          shippingTotal = 0
        } else {
          shippingTotal = shippingOpt.amount
        }
      } else {
        // Unknown shipping option — default to standard
        shippingTotal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
      }
    } else if (shippingOptionId === 'express') {
      shippingMethodName = 'Express Shipping'
      shippingTotal = EXPRESS_SHIPPING
    } else {
      // Standard shipping
      shippingTotal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
    }

    const total = subtotal + shippingTotal

    // Look up existing customer by email to link order
    let customerId: string | null = null
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()
    if (existingCustomer) {
      customerId = existingCustomer.id
    }

    // Normalize country_code to lowercase 2-letter code
    const normalizedAddress = {
      ...shippingAddress,
      country_code: (shippingAddress.country_code || 'xk').toLowerCase().slice(0, 2),
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: normalizedEmail,
        customer_id: customerId,
        status: 'pending',
        fulfillment_status: 'not_fulfilled',
        payment_status: 'awaiting',
        currency_code: 'eur',
        subtotal,
        shipping_total: shippingTotal,
        total,
        shipping_address: normalizedAddress,
        billing_address: normalizedAddress,
        shipping_method: shippingMethodName,
        metadata: sanitizedNote ? { note: sanitizedNote } : {},
      })
      .select('id, display_id')
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: `Failed to create order: ${orderError.message}` }, { status: 500 })
    }

    // Create order items
    const itemsWithOrderId = orderItems.map((item: Record<string, unknown>) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)

    if (itemsError) {
      console.error('Order items error:', itemsError)
      // Rollback: delete the order since it has no items
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: `Failed to create order items: ${itemsError.message}` }, { status: 500 })
    }

    // Send confirmation email — must await to prevent serverless function from
    // terminating before the email is sent (Vercel kills the process after response)
    const orderNumber = `AF-${order.display_id}`
    try {
      await sendOrderConfirmationEmail({
        orderNumber,
        displayId: order.display_id,
        email: normalizedEmail,
        items: orderItems.map((item: { title: string; subtitle?: string | null; quantity: number; unit_price: number; total: number; thumbnail?: string | null }) => ({
          title: item.title,
          subtitle: item.subtitle,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          thumbnail: item.thumbnail,
        })),
        subtotal,
        shippingTotal,
        total,
        shippingAddress: normalizedAddress,
        shippingMethod: shippingMethodName,
      })
    } catch (err) {
      // Email failure should not block the order — log and continue
      console.error('[Checkout] Email send failed:', err)
    }

    return NextResponse.json({
      order: {
        id: order.id,
        display_id: order.display_id,
        email: normalizedEmail,
        status: 'pending',
        total,
        subtotal,
        shipping_total: shippingTotal,
      },
    })
  } catch (error) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
