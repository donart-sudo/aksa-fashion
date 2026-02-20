-- Aksa Fashion — Supabase Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- ── Categories ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Collections ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Products ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'proposed', 'rejected')),
  thumbnail TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Product Images ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Product Options (e.g. Size, Color) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Product Option Values ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES product_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Product Variants ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sku TEXT,
  price_amount INTEGER NOT NULL DEFAULT 0,       -- in EUR whole numbers
  currency_code TEXT DEFAULT 'eur',
  inventory_quantity INTEGER DEFAULT 50,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Product ↔ Category junction ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- ── Product ↔ Collection junction ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_collections (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- ── Product Tags ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Customers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,  -- links to auth.users
  email TEXT UNIQUE NOT NULL,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Customer Addresses ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address_1 TEXT NOT NULL,
  address_2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  country_code TEXT DEFAULT 'xk',
  phone TEXT,
  is_default_shipping BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Orders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id SERIAL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  fulfillment_status TEXT DEFAULT 'not_fulfilled',
  payment_status TEXT DEFAULT 'awaiting',
  currency_code TEXT DEFAULT 'eur',
  subtotal INTEGER DEFAULT 0,
  shipping_total INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  shipping_address JSONB,
  billing_address JSONB,
  shipping_method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Order Items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  thumbnail TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Shipping Options ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipping_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,            -- in cents
  min_subtotal INTEGER DEFAULT 0,               -- minimum order for this option
  max_subtotal INTEGER,                         -- maximum order (null = no limit)
  estimated_days TEXT DEFAULT '3-5 business days',
  is_free_threshold BOOLEAN DEFAULT false,      -- true if free shipping above threshold
  free_threshold_amount INTEGER DEFAULT 0,      -- threshold in cents
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Promotions / Discounts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'standard' CHECK (type IN ('standard', 'buyget')),
  is_automatic BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value NUMERIC DEFAULT 0,
  currency_code TEXT DEFAULT 'eur',
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Admin Users ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,  -- links to auth.users
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Store Settings ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'Aksa Fashion',
  default_currency_code TEXT DEFAULT 'eur',
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_handle ON products(handle);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ══════════════════════════════════════════════════════════════════════════════
-- FULL-TEXT SEARCH
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE products ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_products_fts ON products USING gin(fts);

-- Search function
CREATE OR REPLACE FUNCTION search_products(search_query TEXT, result_limit INTEGER DEFAULT 12)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
    SELECT p.*
    FROM products p
    WHERE p.status = 'published'
      AND (
        p.fts @@ plainto_tsquery('english', search_query)
        OR p.title ILIKE '%' || search_query || '%'
        OR p.description ILIKE '%' || search_query || '%'
      )
    ORDER BY
      ts_rank(p.fts, plainto_tsquery('english', search_query)) DESC,
      p.created_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Public read for storefront data
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read product_options" ON product_options FOR SELECT USING (true);
CREATE POLICY "Public read product_option_values" ON product_option_values FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read product_categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Public read product_collections" ON product_collections FOR SELECT USING (true);
CREATE POLICY "Public read product_tags" ON product_tags FOR SELECT USING (true);
CREATE POLICY "Public read shipping_options" ON shipping_options FOR SELECT USING (true);
CREATE POLICY "Public read store_settings" ON store_settings FOR SELECT USING (true);

-- Customers can read/update their own data
CREATE POLICY "Customers read own data" ON customers
  FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Customers update own data" ON customers
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Customers read own addresses" ON customer_addresses
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "Customers manage own addresses" ON customer_addresses
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Customers read own orders" ON orders
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Customers read own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- Promotions: public read for active ones
CREATE POLICY "Public read active promotions" ON promotions
  FOR SELECT USING (status = 'active');

-- Admin users: read own record
CREATE POLICY "Admin read own" ON admin_users
  FOR SELECT USING (auth.uid() = auth_user_id);

-- ── Admin write policies ────────────────────────────────────────────────────
-- Helper: check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Admin can manage all product-related tables
CREATE POLICY "Admin manage products" ON products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage product_images" ON product_images
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage product_options" ON product_options
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage product_option_values" ON product_option_values
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage product_variants" ON product_variants
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage categories" ON categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage collections" ON collections
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage product_categories" ON product_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage product_collections" ON product_collections
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage product_tags" ON product_tags
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage promotions" ON promotions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage store_settings" ON store_settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Admin can read and update all orders and customers
CREATE POLICY "Admin manage orders" ON orders
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage order_items" ON order_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin read all customers" ON customers
  FOR SELECT USING (is_admin());
CREATE POLICY "Admin manage customer_addresses" ON customer_addresses
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED SHIPPING OPTIONS
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO shipping_options (name, amount, estimated_days) VALUES
  ('Standard Shipping', 1500, '3-5 business days'),
  ('Express Shipping', 3000, '1-2 business days'),
  ('Free Shipping', 0, '3-5 business days')
ON CONFLICT DO NOTHING;

-- Seed store settings
INSERT INTO store_settings (name, default_currency_code) VALUES
  ('Aksa Fashion', 'eur')
ON CONFLICT DO NOTHING;
