/**
 * Seed Supabase database with Aksa Fashion product data.
 *
 * Usage:
 *   Set env vars NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then:
 *   npx tsx scripts/seed-supabase.ts
 *
 * This script:
 * 1. Inserts 7 categories and 22 collections
 * 2. Inserts all products with images, variants, options, and category links
 * 3. Creates the admin user
 */

import { createClient } from "@supabase/supabase-js";

// --- ENV -------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- Static data (imported at runtime) -------------------------------------
// We dynamically import so the script works from the project root via tsx.

async function main() {
  console.log("Starting seed...\n");

  // Dynamic import — tsx resolves the path alias via tsconfig
  const { products, categories: catDefs, collections: colDefs } = await import(
    "../src/lib/data/products"
  );

  // ── 1. Categories ─────────────────────────────────────────────────────────
  console.log(`Seeding ${catDefs.length} categories...`);
  const categoryMap = new Map<string, string>(); // handle → uuid

  for (let i = 0; i < catDefs.length; i++) {
    const cat = catDefs[i];
    const { data, error } = await supabase
      .from("categories")
      .upsert({ name: cat.title, handle: cat.handle, rank: i }, { onConflict: "handle" })
      .select("id")
      .single();
    if (error) {
      console.error(`  Category "${cat.handle}":`, error.message);
    } else {
      categoryMap.set(cat.handle, data.id);
      console.log(`  ✓ ${cat.title}`);
    }
  }

  // ── 2. Collections ────────────────────────────────────────────────────────
  console.log(`\nSeeding ${colDefs.length} collections...`);
  const collectionMap = new Map<string, string>(); // handle → uuid

  for (const col of colDefs) {
    const { data, error } = await supabase
      .from("collections")
      .upsert({ title: col.title, handle: col.handle }, { onConflict: "handle" })
      .select("id")
      .single();
    if (error) {
      console.error(`  Collection "${col.handle}":`, error.message);
    } else {
      collectionMap.set(col.handle, data.id);
      console.log(`  ✓ ${col.title}`);
    }
  }

  // ── 3. Products ───────────────────────────────────────────────────────────
  console.log(`\nSeeding ${products.length} products...`);

  for (const p of products) {
    // 3a. Upsert product
    const { data: prod, error: prodErr } = await supabase
      .from("products")
      .upsert(
        {
          title: p.name,
          handle: p.slug,
          description: p.description,
          status: "published",
          thumbnail: p.images[0] || null,
        },
        { onConflict: "handle" }
      )
      .select("id")
      .single();

    if (prodErr || !prod) {
      console.error(`  Product "${p.slug}":`, prodErr?.message);
      continue;
    }

    const productId = prod.id;

    // 3b. Images
    // Delete existing first (idempotent)
    await supabase.from("product_images").delete().eq("product_id", productId);
    if (p.images.length > 0) {
      const imageRows = p.images.map((url: string, idx: number) => ({
        product_id: productId,
        url,
        rank: idx,
      }));
      await supabase.from("product_images").insert(imageRows);
    }

    // 3c. Product option: Size
    await supabase.from("product_options").delete().eq("product_id", productId);
    if (p.sizes.length > 0) {
      const { data: sizeOpt } = await supabase
        .from("product_options")
        .insert({ product_id: productId, title: "Size" })
        .select("id")
        .single();

      if (sizeOpt) {
        const sizeVals = p.sizes.map((s: string) => ({
          option_id: sizeOpt.id,
          value: s,
        }));
        await supabase.from("product_option_values").insert(sizeVals);
      }
    }

    // 3d. Product option: Color
    if (p.colors.length > 0) {
      const { data: colorOpt } = await supabase
        .from("product_options")
        .insert({ product_id: productId, title: "Color" })
        .select("id")
        .single();

      if (colorOpt) {
        const colorVals = p.colors.map((c: string) => ({
          option_id: colorOpt.id,
          value: c,
        }));
        await supabase.from("product_option_values").insert(colorVals);
      }
    }

    // 3e. Variants — one variant per size
    await supabase.from("product_variants").delete().eq("product_id", productId);
    const variantRows = (p.sizes.length > 0 ? p.sizes : ["Default"]).map(
      (size: string, idx: number) => ({
        product_id: productId,
        title: size === "Default" ? p.name : `${p.name} — ${size}`,
        sku: `${p.slug}-${size.toLowerCase()}`,
        price_amount: p.price,
        currency_code: "eur",
        inventory_quantity: 50,
      })
    );
    await supabase.from("product_variants").insert(variantRows);

    // 3f. Category links
    await supabase.from("product_categories").delete().eq("product_id", productId);
    for (const catName of p.categories) {
      // Find category by title match (case-insensitive)
      const catHandle = catDefs.find(
        (c: { title: string; handle: string }) =>
          c.title.toLowerCase() === catName.toLowerCase()
      )?.handle;
      if (catHandle && categoryMap.has(catHandle)) {
        await supabase.from("product_categories").insert({
          product_id: productId,
          category_id: categoryMap.get(catHandle),
        });
      }
    }

    // 3g. Collection link
    if (p.collection) {
      const colHandle = colDefs.find(
        (c: { title: string; handle: string }) =>
          c.title.toLowerCase() === p.collection!.toLowerCase()
      )?.handle;
      if (colHandle && collectionMap.has(colHandle)) {
        await supabase
          .from("product_collections")
          .upsert(
            { product_id: productId, collection_id: collectionMap.get(colHandle) },
            { onConflict: "product_id,collection_id" }
          );
      }
    }

    console.log(`  ✓ ${p.name} (€${p.price})`);
  }

  // ── 4. Admin user ─────────────────────────────────────────────────────────
  console.log("\nCreating admin user...");
  const adminEmail = "admin@aksafashion.com";
  const adminPassword = "AksaAdmin123!";

  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (authErr) {
    if (authErr.message.includes("already been registered")) {
      console.log("  Admin user already exists, skipping auth creation.");
      // Fetch existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find((u: { email?: string }) => u.email === adminEmail);
      if (existing) {
        await supabase
          .from("admin_users")
          .upsert(
            { auth_user_id: existing.id, email: adminEmail, role: "admin" },
            { onConflict: "email" }
          );
        console.log("  ✓ admin_users record ensured.");
      }
    } else {
      console.error("  Auth error:", authErr.message);
    }
  } else if (authUser?.user) {
    await supabase.from("admin_users").upsert(
      { auth_user_id: authUser.user.id, email: adminEmail, role: "admin" },
      { onConflict: "email" }
    );
    console.log(`  ✓ ${adminEmail} created.`);
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("\nSeed complete!");
  console.log(`  ${catDefs.length} categories`);
  console.log(`  ${colDefs.length} collections`);
  console.log(`  ${products.length} products`);
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
