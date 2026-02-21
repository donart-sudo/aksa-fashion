import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const { email, orderNumber } = await request.json()

    if (!email || !orderNumber) {
      return NextResponse.json({ error: 'Email and order number are required' }, { status: 400 })
    }

    // Parse display_id from "AF-123" or just "123"
    const displayId = parseInt(String(orderNumber).replace(/^AF-/i, ''), 10)
    if (isNaN(displayId)) {
      return NextResponse.json({ error: 'Invalid order number' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(id, title, subtitle, thumbnail, quantity, unit_price, total)
      `)
      .eq('display_id', displayId)
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found. Please check your email and order number.' }, { status: 404 })
    }

    return NextResponse.json({
      order: {
        id: data.id,
        display_id: data.display_id,
        email: data.email,
        status: data.status,
        created_at: data.created_at,
        items: (data.order_items || []).map((item: {
          id: string; title: string; subtitle?: string; thumbnail?: string;
          quantity: number; unit_price: number; total: number
        }) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          thumbnail: item.thumbnail,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        })),
        shipping_address: data.shipping_address,
        shipping_method: data.shipping_method,
        subtotal: data.subtotal,
        shipping_total: data.shipping_total,
        total: data.total,
        payment_status: data.payment_status,
        fulfillment_status: data.fulfillment_status,
      },
    })
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
