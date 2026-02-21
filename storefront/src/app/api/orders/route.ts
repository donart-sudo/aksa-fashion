import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
    }

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(id, title, subtitle, thumbnail, quantity, unit_price, total, metadata)
      `)
      .eq('id', orderId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      order: {
        id: data.id,
        display_id: data.display_id,
        email: data.email,
        status: data.status,
        created_at: data.created_at,
        items: (data.order_items || []).map((item: {
          id: string
          title: string
          subtitle?: string
          thumbnail?: string
          quantity: number
          unit_price: number
          total: number
          metadata?: Record<string, unknown>
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
        shipping_methods: data.shipping_method
          ? [{ name: data.shipping_method, amount: data.shipping_total }]
          : [],
        subtotal: data.subtotal,
        shipping_total: data.shipping_total,
        total: data.total,
        payment_status: data.payment_status,
        fulfillment_status: data.fulfillment_status,
      },
    })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
