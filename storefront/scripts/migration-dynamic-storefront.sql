-- Dynamic Storefront Migration
-- Creates server-side cart and wishlist tables for logged-in customers

-- ═══════════════════════════════════════════
-- customer_carts — server-side cart persistence
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS customer_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  handle TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, variant_id, size, color)
);

CREATE INDEX IF NOT EXISTS idx_customer_carts_customer ON customer_carts(customer_id);

-- RLS: customers manage their own cart rows
ALTER TABLE customer_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own cart"
  ON customer_carts FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Customers can insert own cart"
  ON customer_carts FOR INSERT
  WITH CHECK (customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Customers can update own cart"
  ON customer_carts FOR UPDATE
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Customers can delete own cart"
  ON customer_carts FOR DELETE
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  ));


-- ═══════════════════════════════════════════
-- customer_wishlists — server-side wishlist persistence
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS customer_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  handle TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER,
  thumbnail TEXT,
  hover_image TEXT,
  badge TEXT CHECK (badge IN ('new', 'sale', 'bestseller')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_wishlists_customer ON customer_wishlists(customer_id);

-- RLS: customers manage their own wishlist rows
ALTER TABLE customer_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own wishlist"
  ON customer_wishlists FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Customers can insert own wishlist"
  ON customer_wishlists FOR INSERT
  WITH CHECK (customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Customers can delete own wishlist"
  ON customer_wishlists FOR DELETE
  USING (customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  ));
