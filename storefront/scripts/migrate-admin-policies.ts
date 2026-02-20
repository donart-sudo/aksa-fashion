// @ts-nocheck
/**
 * Adds admin write RLS policies to Supabase.
 * Run: npx tsx scripts/migrate-admin-policies.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import pg from 'pg'

// Load .env.local
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq)
      const value = trimmed.slice(eq + 1)
      if (!process.env[key]) process.env[key] = value
    }
  } catch {}
}

loadEnv()

const DATABASE_URL = process.env.DATABASE_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.local')
  process.exit(1)
}

// Each statement must be run separately via pg
const statements = [
  // 1. Create the is_admin helper function
  `CREATE OR REPLACE FUNCTION is_admin()
   RETURNS BOOLEAN AS $$
     SELECT EXISTS (
       SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()
     );
   $$ LANGUAGE sql SECURITY DEFINER;`,

  // 2-17. Create policies (each as a separate statement)
  ...([
    ['Admin manage products', 'products'],
    ['Admin manage product_images', 'product_images'],
    ['Admin manage product_options', 'product_options'],
    ['Admin manage product_option_values', 'product_option_values'],
    ['Admin manage product_variants', 'product_variants'],
    ['Admin manage categories', 'categories'],
    ['Admin manage collections', 'collections'],
    ['Admin manage product_categories', 'product_categories'],
    ['Admin manage product_collections', 'product_collections'],
    ['Admin manage product_tags', 'product_tags'],
    ['Admin manage promotions', 'promotions'],
    ['Admin manage store_settings', 'store_settings'],
    ['Admin manage orders', 'orders'],
    ['Admin manage order_items', 'order_items'],
    ['Admin manage customer_addresses', 'customer_addresses'],
  ].map(([name, table]) =>
    `DO $$ BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '${name}') THEN
         CREATE POLICY "${name}" ON ${table} FOR ALL USING (is_admin()) WITH CHECK (is_admin());
       END IF;
     END $$;`
  )),

  // Admin read all customers (SELECT only, not ALL)
  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin read all customers') THEN
       CREATE POLICY "Admin read all customers" ON customers FOR SELECT USING (is_admin());
     END IF;
   END $$;`,
]

async function tryPgDirect() {
  // Try the DATABASE_URL as-is first
  console.log('Approach 1: Direct PG connection...')
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected!')

  for (const stmt of statements) {
    await client.query(stmt)
  }
  await client.end()
  return true
}

async function tryPgSessionPooler() {
  // Try session pooler (port 5432 on the pooler host)
  console.log('Approach 2: Session pooler (port 5432)...')
  const modified = DATABASE_URL!.replace(':6543/', ':5432/')
  const client = new pg.Client({ connectionString: modified, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected!')

  for (const stmt of statements) {
    await client.query(stmt)
  }
  await client.end()
  return true
}

async function tryPgDirectHost() {
  // Try direct connection via db.<ref>.supabase.co:5432
  if (!SUPABASE_URL) throw new Error('No SUPABASE_URL')
  console.log('Approach 3: Direct host connection...')

  const ref = new URL(SUPABASE_URL).hostname.split('.')[0]
  const url = new URL(DATABASE_URL!)
  const directUrl = `postgresql://${url.username}:${url.password}@db.${ref}.supabase.co:5432/postgres`

  const client = new pg.Client({ connectionString: directUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected!')

  for (const stmt of statements) {
    await client.query(stmt)
  }
  await client.end()
  return true
}

async function trySupabaseApi() {
  // Try Supabase SQL API endpoint
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('No SUPABASE_URL or SERVICE_KEY')
  console.log('Approach 4: Supabase SQL API...')

  const fullSql = statements.join('\n')

  // Try the pg/query endpoint (available on some Supabase versions)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: fullSql }),
  })

  if (res.ok) return true

  // If that didn't work, try individual statements via a different approach
  throw new Error(`API returned ${res.status}: ${await res.text()}`)
}

async function main() {
  console.log('Adding admin write RLS policies to Supabase...\n')

  const approaches = [tryPgDirect, tryPgSessionPooler, tryPgDirectHost, trySupabaseApi]

  for (const approach of approaches) {
    try {
      await approach()
      console.log('\nDone! Admin write policies added successfully.')
      console.log('The admin dashboard can now create, update, and delete products.')
      return
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`  Failed: ${msg}\n`)
    }
  }

  console.error('\nAll connection approaches failed.')
  console.error('Please run the SQL manually in Supabase Dashboard > SQL Editor.')
  console.error('File: storefront/scripts/add-admin-policies.sql')
  process.exit(1)
}

main()
