/**
 * Creates the content_blocks table in Supabase.
 * Run: npx tsx scripts/setup-content-blocks.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";

// Parse .env.local manually
const scriptDir = typeof __dirname !== "undefined" ? __dirname : new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const envPath = resolve(scriptDir, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split(/\r?\n/)) {
  const idx = line.indexOf("=");
  if (idx > 0) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
}

const dbUrl = env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sqlStatements = [
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

async function run() {
  console.log("Connecting to database...");
  const client = new pg.Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log("Connected.\n");

    for (const sql of sqlStatements) {
      await client.query(sql);
      const preview = sql.replace(/\s+/g, " ").slice(0, 70);
      console.log(`  OK: ${preview}...`);
    }

    console.log("\nDone! content_blocks table created successfully.");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
