import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Admin database proxy — routes write operations through the service role key
 * to bypass RLS. Validates the caller is an authenticated admin first.
 *
 * POST /api/admin/db
 * Body: { table, operation, data?, match?, select?, order?, limit? }
 */

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false

  const token = authHeader.slice(7)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false

  const admin = getServiceClient()
  const { data } = await admin
    .from('admin_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  return !!data
}

export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { table, operation, data, match, select: selectFields, order, limit, onConflict } = body

  if (!table || !operation) {
    return NextResponse.json({ error: 'Missing table or operation' }, { status: 400 })
  }

  const admin = getServiceClient()

  try {
    let result: { data: unknown; error: unknown; count?: number | null }

    switch (operation) {
      case 'select': {
        let q = admin.from(table).select(selectFields || '*', { count: 'exact' })
        if (match) {
          for (const [key, value] of Object.entries(match)) {
            q = q.eq(key, value)
          }
        }
        if (order) q = q.order(order.column, { ascending: order.ascending ?? false })
        if (limit) q = q.limit(limit)
        result = await q
        break
      }
      case 'select_single': {
        let q = admin.from(table).select(selectFields || '*')
        if (match) {
          for (const [key, value] of Object.entries(match)) {
            q = q.eq(key, value)
          }
        }
        result = await q.single()
        break
      }
      case 'insert': {
        result = await admin.from(table).insert(data).select().single()
        break
      }
      case 'upsert': {
        const upsertOpts = onConflict ? { onConflict } : undefined
        result = await admin.from(table).upsert(data, upsertOpts).select(selectFields || '*')
        break
      }
      case 'update': {
        let q = admin.from(table).update(data)
        if (match) {
          for (const [key, value] of Object.entries(match)) {
            q = q.eq(key, value)
          }
        }
        result = await q.select().single()
        break
      }
      case 'delete': {
        let q = admin.from(table).delete()
        if (match) {
          for (const [key, value] of Object.entries(match)) {
            q = q.eq(key, value)
          }
        }
        result = await q
        break
      }
      default:
        return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 })
    }

    if (result.error) {
      const err = result.error as { message?: string }
      return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ data: result.data, count: result.count })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
