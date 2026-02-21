-- Create content_blocks table for the Visual Content Editor
CREATE TABLE IF NOT EXISTS content_blocks (
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
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_section_key ON content_blocks(section_key);
CREATE INDEX IF NOT EXISTS idx_content_blocks_locale ON content_blocks(locale);

ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_blocks' AND policyname = 'Public read published content_blocks') THEN
    CREATE POLICY "Public read published content_blocks" ON content_blocks FOR SELECT USING (published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_blocks' AND policyname = 'Admin manage content_blocks') THEN
    CREATE POLICY "Admin manage content_blocks" ON content_blocks FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END $$;
