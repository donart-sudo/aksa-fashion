import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en/account'

  if (!code) {
    return NextResponse.redirect(`${origin}${next}?error=no_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}${next}?error=auth_failed`)
  }

  // Ensure a customer record exists (first-time OAuth users won't have one)
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('customers')
    .select('id')
    .eq('auth_user_id', data.user.id)
    .single()

  if (!existing) {
    const meta = data.user.user_metadata || {}
    const fullName = meta.full_name || meta.name || ''
    const parts = fullName.split(' ')
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ') || ''

    await admin.from('customers').insert({
      auth_user_id: data.user.id,
      email: data.user.email ?? '',
      first_name: firstName,
      last_name: lastName,
    })
  }

  return NextResponse.redirect(`${origin}${next}`)
}
