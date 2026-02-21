import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password, first_name, last_name } = await request.json()

    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Use the standard Supabase client (not admin) to trigger the confirmation email
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Determine the site URL for the confirmation redirect
    const origin = request.headers.get('origin')
      || process.env.NEXT_PUBLIC_SITE_URL
      || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name, last_name },
        emailRedirectTo: `${origin}/api/auth/callback?next=/en/account`,
      },
    })

    if (error) {
      if (error.message?.includes('already been registered') || error.message?.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message || 'Registration failed' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      )
    }

    // Create customer record using admin client (bypasses RLS)
    const admin = createAdminClient()
    const { error: customerError } = await admin.from('customers').insert({
      auth_user_id: data.user.id,
      email,
      first_name,
      last_name,
    })

    if (customerError) {
      // If customer insert fails due to duplicate, that's OK (user may have registered before)
      if (!customerError.message?.includes('duplicate')) {
        // Cleanup: delete auth user if customer creation fails
        await admin.auth.admin.deleteUser(data.user.id)
        return NextResponse.json(
          { error: 'Registration failed' },
          { status: 500 }
        )
      }
    }

    // Link any existing guest orders (customer_id IS NULL) to this new customer
    try {
      const { data: customerRow } = await admin
        .from('customers')
        .select('id')
        .eq('email', email)
        .single()

      if (customerRow) {
        const { error: linkError, count } = await admin
          .from('orders')
          .update({ customer_id: customerRow.id })
          .eq('email', email)
          .is('customer_id', null)

        if (linkError) {
          console.warn('Failed to link existing orders to new customer:', linkError.message)
        } else if (count && count > 0) {
          console.log(`Linked ${count} existing order(s) to new customer ${customerRow.id}`)
        }
      }
    } catch (linkErr) {
      // Non-critical — don't fail registration if order linking fails
      console.warn('Error linking orders to new customer:', linkErr)
    }

    // Check if email confirmation is required
    const needsConfirmation = !data.session
    return NextResponse.json({
      success: true,
      needsConfirmation,
    })
  } catch {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
