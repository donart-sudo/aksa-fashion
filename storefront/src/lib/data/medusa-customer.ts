// Medusa v2 Store Customer API — account management
// All functions use session cookies (credentials: "include")

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

export interface CustomerProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone?: string;
  is_default_shipping?: boolean;
}

export interface CustomerOrder {
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
  shipping_address?: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    postal_code: string;
    country_code: string;
    phone?: string;
  };
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

// --- Profile ---

export async function getProfile(): Promise<CustomerProfile | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/customers/me`, {
      headers: headers(),
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.customer;
  } catch {
    return null;
  }
}

export async function updateProfile(updates: {
  first_name?: string;
  last_name?: string;
  phone?: string;
}): Promise<CustomerProfile | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/customers/me`, {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Update profile: ${res.status}`);
    const data = await res.json();
    return data.customer;
  } catch (error) {
    console.error("Failed to update profile:", error);
    return null;
  }
}

// --- Orders ---

export async function getOrders(
  limit = 10,
  offset = 0
): Promise<{ orders: CustomerOrder[]; count: number }> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/orders?limit=${limit}&offset=${offset}&order=-created_at`,
      {
        headers: headers(),
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error(`Get orders: ${res.status}`);
    const data = await res.json();
    return { orders: data.orders || [], count: data.count || 0 };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { orders: [], count: 0 };
  }
}

export async function getOrder(id: string): Promise<CustomerOrder | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/orders/${id}`, {
      headers: headers(),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Get order: ${res.status}`);
    const data = await res.json();
    return data.order;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

// --- Addresses ---

export async function getAddresses(): Promise<CustomerAddress[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/customers/me/addresses`, {
      headers: headers(),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Get addresses: ${res.status}`);
    const data = await res.json();
    return data.addresses || [];
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return [];
  }
}

export async function createAddress(address: {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone?: string;
  is_default_shipping?: boolean;
}): Promise<CustomerAddress | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/customers/me/addresses`, {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify(address),
    });
    if (!res.ok) throw new Error(`Create address: ${res.status}`);
    const data = await res.json();
    return data.address;
  } catch (error) {
    console.error("Failed to create address:", error);
    return null;
  }
}

export async function updateAddress(
  id: string,
  updates: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
    phone?: string;
    is_default_shipping?: boolean;
  }
): Promise<CustomerAddress | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/customers/me/addresses/${id}`,
      {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify(updates),
      }
    );
    if (!res.ok) throw new Error(`Update address: ${res.status}`);
    const data = await res.json();
    return data.address;
  } catch (error) {
    console.error("Failed to update address:", error);
    return null;
  }
}

export async function deleteAddress(id: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/customers/me/addresses/${id}`,
      {
        method: "DELETE",
        headers: headers(),
        credentials: "include",
      }
    );
    return res.ok;
  } catch (error) {
    console.error("Failed to delete address:", error);
    return false;
  }
}
