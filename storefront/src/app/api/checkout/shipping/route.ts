import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subtotalParam = searchParams.get('subtotal')
    const subtotal = subtotalParam ? parseInt(subtotalParam, 10) : 0

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('shipping_options')
      .select('*')
      .order('amount', { ascending: true })

    if (error) throw error

    const options = (data || []).map((opt) => {
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
      if (opt.name === 'Free Shipping' && subtotal < 15000) return false
      if (opt.name === 'Standard Shipping' && subtotal >= 15000) return false
      return true
    })

    return NextResponse.json({ options })
  } catch (error) {
    console.error('Shipping options error:', error)
    return NextResponse.json({ options: [] }, { status: 200 })
  }
}
