-- Aksa Fashion — Add Admin Write RLS Policies
-- Run this in Supabase Dashboard > SQL Editor
--
-- This adds the missing admin write policies so the admin dashboard
-- can create, update, and delete products, orders, etc.

-- Helper function: check if current user is an admin
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
