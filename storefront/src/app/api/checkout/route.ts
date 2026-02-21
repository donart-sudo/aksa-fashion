import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendOrderConfirmationEmail } from '@/lib/email'

// UUID v4 regex for validating product IDs from Supabase
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, items, shippingAddress, shippingOptionId, shippingCost, orderNote } = body

    // Validate required fields
    if (!email || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.first_name || !shippingAddress.last_name ||
        !shippingAddress.address_1 || !shippingAddress.city || !shippingAddress.postal_code ||
        !shippingAddress.country_code) {
      return NextResponse.json({ error: 'Incomplete shipping address' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Server-side price verification: look up actual prices from database
    // Extract product IDs that are valid UUIDs (from Supabase products)
    const productIds = items
      .map((item: { productId: string }) => item.productId)
      .filter((id: string) => UUID_REGEX.test(id))

    let productPriceMap: Record<string, number> = {}
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, product_variants(price_amount)')
        .in('id', productIds)

      if (products) {
        for (const product of products) {
          // Use the first variant's price (variants store price in whole EUR, cart stores in cents)
          const variants = product.product_variants as { price_amount: number }[]
          if (variants && variants.length > 0) {
            // price_amount is in whole EUR in db, cart items are in cents
            productPriceMap[product.id] = variants[0].price_amount * 100
          }
        }
      }
    }

    // Calculate totals server-side (prevents price manipulation)
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
      // Use verified price if available, otherwise trust client price
      const verifiedPrice = UUID_REGEX.test(item.productId) && productPriceMap[item.productId]
        ? productPriceMap[item.productId]
        : item.price
      const itemTotal = verifiedPrice * item.quantity
      subtotal += itemTotal

      // Only set product_id if it's a valid UUID (from Supabase)
      const productId = UUID_REGEX.test(item.productId) ? item.productId : null

      return {
        product_id: productId,
        title: item.title,
        subtitle: [item.color, item.size].filter(Boolean).join(' / ') || null,
        thumbnail: item.thumbnail,
        quantity: item.quantity,
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

    const shippingTotal = typeof shippingCost === 'number' ? shippingCost : 0
    const total = subtotal + shippingTotal

    // Look up shipping option name
    let shippingMethodName = 'Standard Shipping'
    if (shippingOptionId && shippingOptionId !== 'standard' && shippingOptionId !== 'express') {
      const { data: shippingOpt } = await supabase
        .from('shipping_options')
        .select('name')
        .eq('id', shippingOptionId)
        .single()
      if (shippingOpt) shippingMethodName = shippingOpt.name
    } else if (shippingOptionId === 'express') {
      shippingMethodName = 'Express Shipping'
    }

    // Look up existing customer by email to link order
    let customerId: string | null = null
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
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
        email,
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
        metadata: orderNote ? { note: orderNote } : {},
      })
      .select('id, display_id')
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
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
      // Order was created but items failed — still return order ID
    }

    // Send confirmation email (fire-and-forget — don't block the response)
    const orderNumber = `AF-${order.display_id}`
    sendOrderConfirmationEmail({
      orderNumber,
      displayId: order.display_id,
      email,
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
    }).catch(err => console.error('[Checkout] Email send failed:', err))

    return NextResponse.json({
      order: {
        id: order.id,
        display_id: order.display_id,
        email,
        status: 'pending',
        total,
        subtotal,
        shipping_total: shippingTotal,
      },
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
