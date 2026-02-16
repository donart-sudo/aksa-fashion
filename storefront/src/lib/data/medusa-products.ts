// Server-side Medusa API data fetching layer
// Transforms Medusa responses into ScrapedProduct format for component compatibility

import type { ScrapedProduct } from "./products";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

// --- Types for Medusa API responses ---

interface MedusaPrice {
  amount: number;
  currency_code: string;
}

interface MedusaOptionValue {
  value: string;
}

interface MedusaOption {
  title: string;
  values: MedusaOptionValue[];
}

interface MedusaVariant {
  id: string;
  title: string;
  prices: MedusaPrice[];
  options?: { value: string }[];
}

interface MedusaImage {
  url: string;
}

interface MedusaCategory {
  name: string;
  handle: string;
}

interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  thumbnail: string | null;
  images: MedusaImage[];
  options: MedusaOption[];
  variants: MedusaVariant[];
  categories: MedusaCategory[];
  metadata: Record<string, string> | null;
  created_at: string;
}

interface MedusaProductCategory {
  id: string;
  name: string;
  handle: string;
  description: string;
  rank: number;
}

// --- Core fetch helper ---

async function medusaFetch<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  const url = new URL(`${BACKEND_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-publishable-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error(`Medusa API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// --- Transform Medusa product → ScrapedProduct ---

function toScrapedProduct(p: MedusaProduct): ScrapedProduct {
  // Get price from first variant's EUR price
  const eurPrice =
    p.variants?.[0]?.prices?.find((pr) => pr.currency_code === "eur") ??
    p.variants?.[0]?.prices?.[0];
  const price = eurPrice?.amount ?? 0;

  // Get regular price and sale price from metadata
  const regularPrice = p.metadata?.regular_price
    ? Number(p.metadata.regular_price)
    : price;
  const salePrice = p.metadata?.sale_price
    ? Number(p.metadata.sale_price)
    : undefined;

  // Extract unique sizes and colors from options
  const sizeOption = p.options?.find(
    (o) => o.title.toLowerCase() === "size"
  );
  const colorOption = p.options?.find(
    (o) => o.title.toLowerCase() === "color"
  );

  const sizes = sizeOption
    ? sizeOption.values.map((v) => v.value)
    : [];

  // Colors: prefer from options, fallback to metadata
  let colors: string[] = [];
  if (colorOption && colorOption.values.length > 0) {
    colors = colorOption.values.map((v) => v.value);
  } else if (p.metadata?.colors) {
    try {
      colors = JSON.parse(p.metadata.colors);
    } catch {
      colors = [];
    }
  }

  const inStock = p.metadata?.in_stock !== "false";

  return {
    id: hashId(p.id),
    name: p.title,
    slug: p.handle,
    price: salePrice ?? price,
    regularPrice,
    salePrice,
    description: p.description || "",
    images: p.images?.map((img) => img.url) ?? (p.thumbnail ? [p.thumbnail] : []),
    categories: p.categories?.map((c) => c.name) ?? [],
    colors,
    sizes,
    inStock,
  };
}

// Convert Medusa string ID to a numeric ID for ScrapedProduct compatibility
function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// --- Transform for ProductCard format ---

interface ProductCardData {
  id: string;
  title: string;
  handle: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  hoverImage?: string;
  badge?: "new" | "sale" | "bestseller";
  colors?: string[];
  sizes?: string[];
  collection?: string;
}

function toCardFormat(p: ScrapedProduct): ProductCardData {
  const isNew = p.id > 5000; // products with high IDs are newer
  return {
    id: String(p.id),
    title: p.name,
    handle: p.slug,
    price: p.salePrice ? p.salePrice * 100 : p.price * 100,
    originalPrice: p.salePrice ? p.regularPrice * 100 : undefined,
    thumbnail: p.images[0] || "",
    hoverImage: p.images[1],
    badge: p.salePrice ? "sale" : isNew ? "new" : undefined,
    colors: p.colors.length > 0 ? p.colors : undefined,
    sizes: p.sizes.length > 0 ? p.sizes : undefined,
    collection: p.collection || (p.categories.length > 0 ? p.categories[0] : undefined),
  };
}

// --- Product fields for API queries ---

const PRODUCT_FIELDS = [
  "id",
  "title",
  "handle",
  "thumbnail",
  "description",
  "metadata",
  "created_at",
  "*images",
  "*options",
  "*options.values",
  "*variants",
  "*variants.prices",
  "*variants.options",
  "*categories",
].join(",");

// --- Public API functions ---

export async function fetchProducts(params?: {
  limit?: number;
  offset?: number;
  category_id?: string[];
  order?: string;
}): Promise<{ products: ScrapedProduct[]; count: number }> {
  try {
    const queryParams: Record<string, string | number> = {
      limit: params?.limit || 100,
      offset: params?.offset || 0,
      fields: PRODUCT_FIELDS,
    };
    if (params?.order) queryParams.order = params.order;
    if (params?.category_id) {
      queryParams["category_id[]"] = params.category_id.join(",");
    }

    const data = await medusaFetch<{
      products: MedusaProduct[];
      count: number;
    }>("/store/products", queryParams);

    return {
      products: data.products.map(toScrapedProduct),
      count: data.count,
    };
  } catch (error) {
    console.error("Failed to fetch products from Medusa:", error);
    // Fallback to static data
    const { products } = await import("./products");
    return { products, count: products.length };
  }
}

export async function fetchProduct(
  handle: string
): Promise<ScrapedProduct | null> {
  try {
    const data = await medusaFetch<{ products: MedusaProduct[] }>(
      "/store/products",
      {
        handle,
        fields: PRODUCT_FIELDS,
        limit: 1,
      }
    );

    if (data.products.length === 0) return null;
    return toScrapedProduct(data.products[0]);
  } catch (error) {
    console.error(`Failed to fetch product ${handle}:`, error);
    // Fallback to static data
    const { getProductBySlug } = await import("./products");
    return getProductBySlug(handle);
  }
}

export async function fetchProductHandles(): Promise<string[]> {
  try {
    const data = await medusaFetch<{
      products: { handle: string }[];
      count: number;
    }>("/store/products", {
      fields: "handle",
      limit: 200,
    });

    return data.products.map((p) => p.handle);
  } catch (error) {
    console.error("Failed to fetch product handles:", error);
    const { products } = await import("./products");
    return products.map((p) => p.slug);
  }
}

export async function fetchCategories(): Promise<
  { handle: string; title: string; id: string }[]
> {
  try {
    const data = await medusaFetch<{
      product_categories: MedusaProductCategory[];
    }>("/store/product-categories", { limit: 50 });

    return data.product_categories.map((c) => ({
      id: c.id,
      handle: c.handle,
      title: c.name,
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    const { categories } = await import("./products");
    return categories.map((c) => ({ ...c, id: "" }));
  }
}

export async function fetchProductsByCategory(
  categoryHandle: string
): Promise<ScrapedProduct[]> {
  try {
    // First get category ID from handle
    const catData = await medusaFetch<{
      product_categories: MedusaProductCategory[];
    }>("/store/product-categories", {
      handle: categoryHandle,
      limit: 1,
    });

    if (catData.product_categories.length === 0) return [];

    const categoryId = catData.product_categories[0].id;

    const data = await medusaFetch<{ products: MedusaProduct[] }>(
      "/store/products",
      {
        "category_id[]": categoryId,
        fields: PRODUCT_FIELDS,
        limit: 100,
      }
    );

    return data.products.map(toScrapedProduct);
  } catch (error) {
    console.error(
      `Failed to fetch products for category ${categoryHandle}:`,
      error
    );
    const { getProductsByCategory } = await import("./products");
    return getProductsByCategory(categoryHandle).map((p) => {
      // getProductsByCategory returns card format, we need ScrapedProduct
      const { products } = require("./products");
      return products.find(
        (prod: ScrapedProduct) => prod.slug === p.handle
      ) as ScrapedProduct;
    });
  }
}

export async function fetchNewProducts(
  limit?: number
): Promise<ScrapedProduct[]> {
  try {
    const data = await medusaFetch<{ products: MedusaProduct[] }>(
      "/store/products",
      {
        fields: PRODUCT_FIELDS,
        limit: limit || 20,
        order: "-created_at",
      }
    );

    return data.products.map(toScrapedProduct);
  } catch (error) {
    console.error("Failed to fetch new products:", error);
    const { products } = await import("./products");
    return products
      .filter((p) => p.id > 5200)
      .slice(0, limit || 20);
  }
}

export async function fetchSaleProducts(): Promise<ScrapedProduct[]> {
  const { products } = await fetchProducts({ limit: 100 });
  return products.filter((p) => p.salePrice !== undefined);
}

// --- Card format helpers (for components that expect card format) ---

export async function fetchProductsForCards(
  limit?: number
): Promise<ProductCardData[]> {
  const { products } = await fetchProducts({
    limit: limit || 100,
    order: "-created_at",
  });
  return products.map(toCardFormat);
}

export async function fetchNewProductsForCards(
  limit?: number
): Promise<ProductCardData[]> {
  const products = await fetchNewProducts(limit);
  return products.map(toCardFormat);
}

export async function fetchSaleProductsForCards(): Promise<ProductCardData[]> {
  const products = await fetchSaleProducts();
  return products.map(toCardFormat);
}

export async function fetchProductsByCategoryForCards(
  categoryHandle: string
): Promise<ProductCardData[]> {
  const products = await fetchProductsByCategory(categoryHandle);
  return products.map(toCardFormat);
}

// --- Search function ---

export async function searchProducts(query: string, limit = 12): Promise<ProductCardData[]> {
  try {
    const data = await medusaFetch<{ products: MedusaProduct[] }>(
      "/store/products",
      {
        q: query,
        fields: PRODUCT_FIELDS,
        limit,
      }
    );
    return data.products.map(toScrapedProduct).map(toCardFormat);
  } catch (error) {
    console.error("Failed to search products:", error);
    const { products } = await import("./products");
    return products
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)
      .map(toCardFormat);
  }
}

// --- Category cover image helper ---

export async function fetchCategoryCover(
  categoryHandle: string
): Promise<string> {
  const products = await fetchProductsByCategory(categoryHandle);
  return products[0]?.images[0] || "";
}
