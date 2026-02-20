import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

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

    const admin = createAdminClient()

    // Create auth user with auto-confirm (no email verification needed)
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error || !data.user) {
      // Handle duplicate email
      if (error?.message?.includes('already been registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error?.message || 'Registration failed' },
        { status: 400 }
      )
    }

    // Create customer record (service role bypasses RLS)
    const { error: customerError } = await admin.from('customers').insert({
      auth_user_id: data.user.id,
      email,
      first_name,
      last_name,
    })

    if (customerError) {
      // Cleanup: delete auth user if customer creation fails
      await admin.auth.admin.deleteUser(data.user.id)
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
