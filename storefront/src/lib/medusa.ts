import Medusa from "@medusajs/js-sdk";

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
});

// Helper to get products with error handling
export async function getProducts(params?: {
  limit?: number;
  offset?: number;
  collection_id?: string[];
  order?: string;
}) {
  try {
    const { products, count } = await sdk.store.product.list({
      limit: params?.limit || 20,
      offset: params?.offset || 0,
      collection_id: params?.collection_id,
      order: params?.order || "-created_at",
      fields:
        "+variants.calculated_price,+variants.inventory_quantity",
    });
    return { products, count };
  } catch {
    console.error("Failed to fetch products");
    return { products: [], count: 0 };
  }
}

// Helper to get a single product
export async function getProduct(handle: string) {
  try {
    const { products } = await sdk.store.product.list({
      handle,
      fields:
        "+variants.calculated_price,+variants.inventory_quantity",
    });
    return products[0] || null;
  } catch {
    console.error(`Failed to fetch product: ${handle}`);
    return null;
  }
}

// Helper to get collections
export async function getCollections(params?: {
  limit?: number;
  offset?: number;
}) {
  try {
    const { collections, count } = await sdk.store.collection.list({
      limit: params?.limit || 100,
      offset: params?.offset || 0,
    });
    return { collections, count };
  } catch {
    console.error("Failed to fetch collections");
    return { collections: [], count: 0 };
  }
}

// Helper to get a single collection
export async function getCollection(handle: string) {
  try {
    const { collections } = await sdk.store.collection.list({
      handle: [handle],
    });
    return collections[0] || null;
  } catch {
    console.error(`Failed to fetch collection: ${handle}`);
    return null;
  }
}
