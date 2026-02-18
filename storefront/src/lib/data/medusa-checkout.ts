// Medusa v2 Store Cart API — checkout flow
// All functions use the publishable API key and session cookies

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": API_KEY,
  };
}

// --- Types ---

export interface MedusaAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone?: string;
}

export interface MedusaCartLineItem {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total: number;
  variant?: {
    id: string;
    title: string;
    options?: { value: string }[];
  };
  product?: {
    id: string;
    title: string;
    handle: string;
    thumbnail?: string;
  };
}

export interface MedusaCart {
  id: string;
  email?: string;
  items: MedusaCartLineItem[];
  subtotal: number;
  shipping_total: number;
  total: number;
  region?: {
    id: string;
    currency_code: string;
  };
  shipping_address?: MedusaAddress;
  shipping_methods?: {
    id: string;
    shipping_option_id: string;
    amount: number;
    name?: string;
  }[];
  payment_collection?: {
    id: string;
  };
}

export interface MedusaShippingOption {
  id: string;
  name: string;
  amount: number;
  is_tax_inclusive: boolean;
  calculated_price?: {
    calculated_amount: number;
  };
}

export interface MedusaRegion {
  id: string;
  name: string;
  currency_code: string;
  countries: { iso_2: string; display_name: string }[];
}

export interface MedusaOrder {
  id: string;
  display_id: number;
  email: string;
  status: string;
  created_at: string;
  items: {
    id: string;
    title: string;
    subtitle?: string;
    thumbnail?: string;
    quantity: number;
    unit_price: number;
    total: number;
    variant?: {
      title: string;
      options?: { value: string }[];
    };
  }[];
  shipping_address?: MedusaAddress;
  shipping_methods?: {
    name?: string;
    amount: number;
  }[];
  subtotal: number;
  shipping_total: number;
  total: number;
  payment_status?: string;
  fulfillment_status?: string;
}

// --- Helper to resolve country name → ISO code ---

const COUNTRY_MAP: Record<string, string> = {
  kosovo: "xk",
  albania: "al",
  germany: "de",
  austria: "at",
  france: "fr",
  italy: "it",
  "united kingdom": "gb",
  uk: "gb",
  switzerland: "ch",
  netherlands: "nl",
  belgium: "be",
  "united states": "us",
  usa: "us",
};

export function resolveCountryCode(countryName: string): string {
  const lower = countryName.toLowerCase().trim();
  // If already an ISO code
  if (lower.length === 2) return lower;
  return COUNTRY_MAP[lower] || "xk";
}

// --- Core API functions ---

export async function getRegions(): Promise<MedusaRegion[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: headers(),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Regions: ${res.status}`);
    const data = await res.json();
    return data.regions || [];
  } catch (error) {
    console.error("Failed to fetch regions:", error);
    return [];
  }
}

export async function createCart(regionId: string): Promise<MedusaCart | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify({ region_id: regionId }),
    });
    if (!res.ok) throw new Error(`Create cart: ${res.status}`);
    const data = await res.json();
    return data.cart;
  } catch (error) {
    console.error("Failed to create cart:", error);
    return null;
  }
}

export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<MedusaCart | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items`, {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify({ variant_id: variantId, quantity }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Add line item: ${res.status} — ${err}`);
    }
    const data = await res.json();
    return data.cart;
  } catch (error) {
    console.error("Failed to add line item:", error);
    return null;
  }
}

export async function updateCart(
  cartId: string,
  updates: {
    email?: string;
    shipping_address?: MedusaAddress;
    billing_address?: MedusaAddress;
  }
): Promise<MedusaCart | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Update cart: ${res.status}`);
    const data = await res.json();
    return data.cart;
  } catch (error) {
    console.error("Failed to update cart:", error);
    return null;
  }
}

export async function getShippingOptions(
  cartId: string
): Promise<MedusaShippingOption[]> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/shipping-options?cart_id=${cartId}`,
      {
        headers: headers(),
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error(`Shipping options: ${res.status}`);
    const data = await res.json();
    return data.shipping_options || [];
  } catch (error) {
    console.error("Failed to fetch shipping options:", error);
    return [];
  }
}

export async function addShippingMethod(
  cartId: string,
  optionId: string
): Promise<MedusaCart | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/carts/${cartId}/shipping-methods`,
      {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ option_id: optionId }),
      }
    );
    if (!res.ok) throw new Error(`Add shipping method: ${res.status}`);
    const data = await res.json();
    return data.cart;
  } catch (error) {
    console.error("Failed to add shipping method:", error);
    return null;
  }
}

export async function initPaymentCollection(
  cartId: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/payment-collections`,
      {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ cart_id: cartId }),
      }
    );
    if (!res.ok) throw new Error(`Init payment collection: ${res.status}`);
    const data = await res.json();
    return data.payment_collection?.id || null;
  } catch (error) {
    console.error("Failed to init payment collection:", error);
    return null;
  }
}

export async function createPaymentSession(
  collectionId: string,
  providerId: string = "pp_system_default"
): Promise<boolean> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/payment-collections/${collectionId}/payment-sessions`,
      {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ provider_id: providerId }),
      }
    );
    if (!res.ok) throw new Error(`Create payment session: ${res.status}`);
    return true;
  } catch (error) {
    console.error("Failed to create payment session:", error);
    return false;
  }
}

export async function completeCart(
  cartId: string
): Promise<MedusaOrder | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/carts/${cartId}/complete`,
      {
        method: "POST",
        headers: headers(),
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error(`Complete cart: ${res.status}`);
    const data = await res.json();
    return data.order || data;
  } catch (error) {
    console.error("Failed to complete cart:", error);
    return null;
  }
}

// --- Variant resolution ---
// Given a product handle (slug) and optional size, fetch the product from Medusa
// and return the real variant ID needed for the Cart API.

export async function resolveVariantId(
  handle: string,
  size?: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/products?handle=${handle}&fields=id,handle,*variants,*variants.options`,
      {
        headers: headers(),
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error(`Resolve variant: ${res.status}`);
    const data = await res.json();
    const product = data.products?.[0];
    if (!product || !product.variants?.length) return null;

    // If no size specified or only one variant, return first
    if (!size || product.variants.length === 1) {
      return product.variants[0].id;
    }

    // Try to find variant matching the size
    const matching = product.variants.find(
      (v: { options?: { value: string }[]; title?: string }) => {
        // Check variant options for matching size value
        if (v.options?.some((o) => o.value.toLowerCase() === size.toLowerCase())) {
          return true;
        }
        // Fallback: check variant title
        if (v.title?.toLowerCase().includes(size.toLowerCase())) {
          return true;
        }
        return false;
      }
    );

    return matching?.id || product.variants[0].id;
  } catch (error) {
    console.error(`Failed to resolve variant for ${handle}:`, error);
    return null;
  }
}

// --- Fetch order by ID (for confirmation page) ---

export async function getOrder(orderId: string): Promise<MedusaOrder | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/orders/${orderId}`,
      {
        headers: headers(),
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error(`Get order: ${res.status}`);
    const data = await res.json();
    return data.order;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}
