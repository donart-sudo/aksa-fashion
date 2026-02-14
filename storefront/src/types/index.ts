export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string;
  images: ProductImage[];
  variants: ProductVariant[];
  collection?: Collection;
  tags?: string[];
  status: "draft" | "published";
  metadata?: Record<string, string>;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  prices: Price[];
  options: ProductOption[];
  inventory_quantity: number;
}

export interface ProductOption {
  id: string;
  value: string;
  option: {
    id: string;
    title: string;
  };
}

export interface Price {
  amount: number;
  currency_code: string;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  thumbnail?: string;
  products?: Product[];
}

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  image?: string;
}
