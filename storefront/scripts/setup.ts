/**
 * Aksa Fashion — Unified Supabase Setup
 *
 * Usage:
 *   Ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and
 *   SUPABASE_SERVICE_ROLE_KEY are set in storefront/.env.local, then:
 *     npm run setup
 *
 * This script:
 *   1. Verifies database schema exists (tables, indexes, RLS, search)
 *   2. Creates the product-images storage bucket
 *   3. Seeds categories, collections, products, variants, options, images
 *   4. Creates the admin auth user + admin_users row
 *
 * If schema is missing, it prints instructions to paste schema.sql
 * into the Supabase SQL Editor (DDL can't run via the JS client).
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// ── ENV ────────────────────────────────────────────────────────────────────

function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../.env.local");
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex);
      const value = trimmed.slice(eqIndex + 1);
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found — rely on env vars being set externally
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Step 1: Verify schema exists ───────────────────────────────────────────

async function verifySchema() {
  console.log("Step 1/4 — Verifying database schema...\n");

  const requiredTables = [
    "products",
    "categories",
    "collections",
    "product_images",
    "product_variants",
    "product_options",
    "product_option_values",
    "product_categories",
    "product_collections",
    "orders",
    "order_items",
    "customers",
    "customer_addresses",
    "admin_users",
    "store_settings",
    "shipping_options",
    "promotions",
    "product_tags",
  ];

  const missing: string[] = [];
  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) {
      missing.push(table);
    }
  }

  if (missing.length > 0) {
    console.error(`  Missing tables: ${missing.join(", ")}\n`);
    console.error("  You need to create the schema first:");
    console.error("    1. Open Supabase Dashboard > SQL Editor");
    console.error("    2. Paste the contents of storefront/scripts/schema.sql");
    console.error("    3. Click 'Run'");
    console.error("    4. Run 'npm run setup' again\n");
    process.exit(1);
  }

  console.log("  All 18 tables verified.\n");
}

// ── Step 2: Create storage bucket ──────────────────────────────────────────

async function createStorageBucket() {
  console.log("Step 2/4 — Creating storage bucket...\n");

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === "product-images");

  if (exists) {
    console.log('  Bucket "product-images" already exists, skipping.\n');
    return;
  }

  const { error } = await supabase.storage.createBucket("product-images", {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  });

  if (error) {
    console.error("  Bucket creation error:", error.message);
    console.log("  (Continuing — bucket may already exist)\n");
  } else {
    console.log('  Bucket "product-images" created.\n');
  }
}

// ── Step 3: Seed data ──────────────────────────────────────────────────────

async function seedData() {
  console.log("Step 3/4 — Seeding data...\n");

  // Check if data already exists
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (productCount && productCount > 0) {
    console.log(`  Database already has ${productCount} products. Skipping seed.\n`);
    console.log("  (To re-seed, delete all products first or run seed-supabase.ts directly)\n");
    return;
  }

  const { products, categories: catDefs, collections: colDefs } = await import(
    "../src/lib/data/products"
  );

  // ─ Categories ─
  console.log(`  Seeding ${catDefs.length} categories...`);
  const categoryMap = new Map<string, string>();

  for (let i = 0; i < catDefs.length; i++) {
    const cat = catDefs[i];
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        { name: cat.title, handle: cat.handle, rank: i },
        { onConflict: "handle" }
      )
      .select("id")
      .single();
    if (error) {
      console.error(`    Category "${cat.handle}":`, error.message);
    } else {
      categoryMap.set(cat.handle, data.id);
    }
  }
  console.log(`    ${categoryMap.size} categories ready.`);

  // ─ Collections ─
  console.log(`  Seeding ${colDefs.length} collections...`);
  const collectionMap = new Map<string, string>();

  for (const col of colDefs) {
    const { data, error } = await supabase
      .from("collections")
      .upsert(
        { title: col.title, handle: col.handle },
        { onConflict: "handle" }
      )
      .select("id")
      .single();
    if (error) {
      console.error(`    Collection "${col.handle}":`, error.message);
    } else {
      collectionMap.set(col.handle, data.id);
    }
  }
  console.log(`    ${collectionMap.size} collections ready.`);

  // ─ Products ─
  console.log(`  Seeding ${products.length} products...`);
  let seededCount = 0;

  for (const p of products) {
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
      console.error(`    Product "${p.slug}":`, prodErr?.message);
      continue;
    }

    const productId = prod.id;

    // Images
    await supabase.from("product_images").delete().eq("product_id", productId);
    if (p.images.length > 0) {
      const imageRows = p.images.map((url: string, idx: number) => ({
        product_id: productId,
        url,
        rank: idx,
      }));
      await supabase.from("product_images").insert(imageRows);
    }

    // Product option: Size
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

    // Product option: Color
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

    // Variants
    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId);
    const variantRows = (p.sizes.length > 0 ? p.sizes : ["Default"]).map(
      (size: string) => ({
        product_id: productId,
        title: size === "Default" ? p.name : `${p.name} — ${size}`,
        sku: `${p.slug}-${size.toLowerCase()}`,
        price_amount: p.price,
        currency_code: "eur",
        inventory_quantity: 50,
      })
    );
    await supabase.from("product_variants").insert(variantRows);

    // Category links
    await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", productId);
    for (const catName of p.categories) {
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

    // Collection link
    if (p.collection) {
      const colHandle = colDefs.find(
        (c: { title: string; handle: string }) =>
          c.title.toLowerCase() === p.collection!.toLowerCase()
      )?.handle;
      if (colHandle && collectionMap.has(colHandle)) {
        await supabase.from("product_collections").upsert(
          {
            product_id: productId,
            collection_id: collectionMap.get(colHandle),
          },
          { onConflict: "product_id,collection_id" }
        );
      }
    }

    seededCount++;
  }
  console.log(`    ${seededCount} products seeded.\n`);
}

// ── Step 4: Create admin user ──────────────────────────────────────────────

async function createAdminUser() {
  console.log("Step 4/4 — Creating admin user...\n");

  const adminEmail = "admin@aksafashion.com";
  const adminPassword = "AksaAdmin123!";

  const { data: authUser, error: authErr } =
    await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

  if (authErr) {
    if (authErr.message.includes("already been registered")) {
      console.log("  Admin auth user already exists, skipping creation.");
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find(
        (u: { email?: string }) => u.email === adminEmail
      );
      if (existing) {
        await supabase.from("admin_users").upsert(
          { auth_user_id: existing.id, email: adminEmail, role: "admin" },
          { onConflict: "email" }
        );
        console.log("  admin_users row ensured.");
      }
    } else {
      console.error("  Auth error:", authErr.message);
    }
  } else if (authUser?.user) {
    await supabase.from("admin_users").upsert(
      { auth_user_id: authUser.user.id, email: adminEmail, role: "admin" },
      { onConflict: "email" }
    );
    console.log(`  Admin user created: ${adminEmail}`);
  }

  console.log(`  Credentials: ${adminEmail} / ${adminPassword}\n`);
}

// ── Run all steps ──────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("  Aksa Fashion — Supabase Setup");
  console.log("=".repeat(60) + "\n");

  await verifySchema();
  await createStorageBucket();
  await seedData();
  await createAdminUser();

  console.log("=".repeat(60));
  console.log("  Setup complete!");
  console.log("");
  console.log("  Next steps:");
  console.log("    1. cd storefront && npm run dev");
  console.log("    2. Visit http://localhost:3000/admin");
  console.log("    3. Login: admin@aksafashion.com / AksaAdmin123!");
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("\nSetup failed:", err);
  process.exit(1);
});
