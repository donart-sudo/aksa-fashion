import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Editor health check + auto-create endpoint.
 *
 * GET  /api/admin/setup-editor → { exists: boolean }
 * POST /api/admin/setup-editor → creates content_blocks table (requires DATABASE_URL)
 */

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return false;

  const admin = getServiceClient();
  const { data } = await admin
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  return !!data;
}

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getServiceClient();
  const { error } = await admin
    .from("content_blocks")
    .select("id", { count: "exact", head: true });

  const exists = !error;
  return NextResponse.json({ exists });
}

const TABLE_SQL = [
  `CREATE TABLE IF NOT EXISTS content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'en',
    content JSONB NOT NULL DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 1,
    published BOOLEAN NOT NULL DEFAULT true,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (section_key, locale)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_content_blocks_section_key ON content_blocks(section_key)`,
  `CREATE INDEX IF NOT EXISTS idx_content_blocks_locale ON content_blocks(locale)`,
  `ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_blocks' AND policyname = 'Public read published content_blocks') THEN
      CREATE POLICY "Public read published content_blocks" ON content_blocks FOR SELECT USING (published = true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_blocks' AND policyname = 'Admin manage content_blocks') THEN
      CREATE POLICY "Admin manage content_blocks" ON content_blocks FOR ALL USING (is_admin()) WITH CHECK (is_admin());
    END IF;
  END $$`,
];

export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL not available in this environment. Run manually: npx tsx scripts/setup-content-blocks.ts",
      },
      { status: 501 }
    );
  }

  try {
    // Dynamic import — pg is a devDependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pg = require("pg") as { Client: new (opts: { connectionString: string }) => { connect(): Promise<void>; query(sql: string): Promise<unknown>; end(): Promise<void> } };
    const client = new pg.Client({ connectionString: dbUrl });
    await client.connect();

    for (const sql of TABLE_SQL) {
      await client.query(sql);
    }

    await client.end();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create table";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
