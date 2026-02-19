import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, items, shippingAddress, shippingOptionId, shippingCost, orderNote } = body

    // Validate required fields
    if (!email || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

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
      const itemTotal = item.price * item.quantity
      subtotal += itemTotal
      return {
        title: item.title,
        subtitle: [item.color, item.size].filter(Boolean).join(' / ') || null,
        thumbnail: item.thumbnail,
        quantity: item.quantity,
        unit_price: item.price,
        total: itemTotal,
        metadata: {
          handle: item.handle,
          size: item.size || null,
          color: item.color || null,
        },
      }
    })

    const shippingTotal = shippingCost || 0
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

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email,
        status: 'pending',
        fulfillment_status: 'not_fulfilled',
        payment_status: 'awaiting',
        currency_code: 'eur',
        subtotal,
        shipping_total: shippingTotal,
        total,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
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
