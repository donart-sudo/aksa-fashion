// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'draft' | 'archived'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned'

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  compareAtPrice?: number
  status: ProductStatus
  category: string
  inventory: number
  image: string
  description: string
  createdAt: string
}

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  orderNumber: string
  customer: string
  customerEmail: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  fulfillment: FulfillmentStatus
  paymentMethod: string
  createdAt: string
  shippingAddress: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  tags: string[]
  joinedAt: string
  lastOrderAt: string
  spendingHistory: { month: string; amount: number }[]
}

export interface MetricData {
  label: string
  value: string
  change: number
  changeLabel: string
}

export interface RevenueDataPoint {
  month: string
  revenue: number
  orders: number
}

export interface CategorySalesPoint {
  name: string
  value: number
  fill: string
}

export interface TrafficSource {
  source: string
  visitors: number
  conversion: number
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  {
    id: 'prod_001',
    name: 'Celestial Ivory Bridal Gown',
    sku: 'AKS-BG-001',
    price: 285000,
    compareAtPrice: 320000,
    status: 'active',
    category: 'Bridal Gowns',
    inventory: 3,
    image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=120&h=120&fit=crop',
    description: 'A-line silhouette with hand-sewn beading and cathedral-length train.',
    createdAt: '2025-11-15',
  },
  {
    id: 'prod_002',
    name: 'Aurora Ball Gown',
    sku: 'AKS-BG-002',
    price: 345000,
    status: 'active',
    category: 'Ball Gowns',
    inventory: 2,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=120&h=120&fit=crop',
    description: 'Dramatic tulle ball gown with Swarovski crystal bodice.',
    createdAt: '2025-11-20',
  },
  {
    id: 'prod_003',
    name: 'Seraphina Evening Dress',
    sku: 'AKS-ED-001',
    price: 178000,
    compareAtPrice: 210000,
    status: 'active',
    category: 'Evening Dresses',
    inventory: 5,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=120&h=120&fit=crop',
    description: 'Flowing chiffon evening dress with hand-embroidered gold thread.',
    createdAt: '2025-12-01',
  },
  {
    id: 'prod_004',
    name: 'Valentina Cape Gown',
    sku: 'AKS-CG-001',
    price: 395000,
    status: 'active',
    category: 'Cape & Train',
    inventory: 1,
    image: 'https://images.unsplash.com/photo-1549416878-b6c06aa8a9f5?w=120&h=120&fit=crop',
    description: 'Luxury bridal gown with detachable cape and royal train.',
    createdAt: '2025-12-05',
  },
  {
    id: 'prod_005',
    name: 'Noir Velvet Evening Gown',
    sku: 'AKS-ED-002',
    price: 195000,
    status: 'active',
    category: 'Evening Dresses',
    inventory: 4,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=120&h=120&fit=crop',
    description: 'Deep black velvet gown with plunging neckline and thigh-high slit.',
    createdAt: '2025-12-10',
  },
  {
    id: 'prod_006',
    name: 'Rosetta Mermaid Gown',
    sku: 'AKS-BG-003',
    price: 310000,
    status: 'draft',
    category: 'Bridal Gowns',
    inventory: 0,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=120&h=120&fit=crop',
    description: 'Figure-hugging mermaid silhouette with Chantilly lace overlay.',
    createdAt: '2026-01-05',
  },
  {
    id: 'prod_007',
    name: 'Elara Champagne Gown',
    sku: 'AKS-BG-004',
    price: 265000,
    status: 'active',
    category: 'Bridal Gowns',
    inventory: 3,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=120&h=120&fit=crop',
    description: 'Champagne-toned gown with 3D floral appliqués and illusion back.',
    createdAt: '2026-01-10',
  },
  {
    id: 'prod_008',
    name: 'Luna Silver Ballgown',
    sku: 'AKS-BG-005',
    price: 420000,
    status: 'active',
    category: 'Ball Gowns',
    inventory: 1,
    image: 'https://images.unsplash.com/photo-1522069213448-443a614da9b6?w=120&h=120&fit=crop',
    description: 'Silver-threaded ballgown with 12-layer tulle skirt.',
    createdAt: '2026-01-15',
  },
  {
    id: 'prod_009',
    name: 'Dahlia Blush Gown',
    sku: 'AKS-ED-003',
    price: 155000,
    status: 'draft',
    category: 'Evening Dresses',
    inventory: 0,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop',
    description: 'Soft blush pink gown with draped bodice and flowing train.',
    createdAt: '2026-01-20',
  },
  {
    id: 'prod_010',
    name: 'Aria Minimalist Gown',
    sku: 'AKS-BG-006',
    price: 225000,
    status: 'archived',
    category: 'Bridal Gowns',
    inventory: 0,
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=120&h=120&fit=crop',
    description: 'Clean-line crepe gown with bow detail at the back.',
    createdAt: '2025-09-01',
  },
  {
    id: 'prod_011',
    name: 'Ophelia Lace Cape Dress',
    sku: 'AKS-CG-002',
    price: 358000,
    status: 'active',
    category: 'Cape & Train',
    inventory: 2,
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=120&h=120&fit=crop',
    description: 'Intricate lace cape dress with cathedral veil attachment.',
    createdAt: '2026-01-25',
  },
  {
    id: 'prod_012',
    name: 'Bianca Strapless Gown',
    sku: 'AKS-BG-007',
    price: 198000,
    status: 'active',
    category: 'Bridal Gowns',
    inventory: 4,
    image: 'https://images.unsplash.com/photo-1585241645927-c7a8e5840c42?w=120&h=120&fit=crop',
    description: 'Classic strapless gown with sweetheart neckline and satin finish.',
    createdAt: '2026-02-01',
  },
]

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders: Order[] = [
  {
    id: 'ord_001',
    orderNumber: '#AKS-1001',
    customer: 'Elona Berisha',
    customerEmail: 'elona.b@gmail.com',
    items: [{ productId: 'prod_001', name: 'Celestial Ivory Bridal Gown', quantity: 1, price: 285000 }],
    total: 285000,
    status: 'delivered',
    fulfillment: 'fulfilled',
    paymentMethod: 'Stripe',
    createdAt: '2026-01-05',
    shippingAddress: 'Rr. Agim Ramadani 42, Prishtina, Kosovo',
  },
  {
    id: 'ord_002',
    orderNumber: '#AKS-1002',
    customer: 'Dafina Krasniqi',
    customerEmail: 'dafina.k@outlook.com',
    items: [
      { productId: 'prod_003', name: 'Seraphina Evening Dress', quantity: 1, price: 178000 },
      { productId: 'prod_005', name: 'Noir Velvet Evening Gown', quantity: 1, price: 195000 },
    ],
    total: 373000,
    status: 'shipped',
    fulfillment: 'fulfilled',
    paymentMethod: 'Stripe',
    createdAt: '2026-01-18',
    shippingAddress: 'Rr. Nena Tereze 15, Prishtina, Kosovo',
  },
  {
    id: 'ord_003',
    orderNumber: '#AKS-1003',
    customer: 'Arta Hoxha',
    customerEmail: 'arta.h@gmail.com',
    items: [{ productId: 'prod_002', name: 'Aurora Ball Gown', quantity: 1, price: 345000 }],
    total: 345000,
    status: 'processing',
    fulfillment: 'unfulfilled',
    paymentMethod: 'Stripe',
    createdAt: '2026-01-25',
    shippingAddress: 'Rr. Luan Haradinaj 8, Prizren, Kosovo',
  },
  {
    id: 'ord_004',
    orderNumber: '#AKS-1004',
    customer: 'Merita Gashi',
    customerEmail: 'merita.g@hotmail.com',
    items: [{ productId: 'prod_004', name: 'Valentina Cape Gown', quantity: 1, price: 395000 }],
    total: 395000,
    status: 'pending',
    fulfillment: 'unfulfilled',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-02-01',
    shippingAddress: 'Rr. Muharrem Fejza 22, Prishtina, Kosovo',
  },
  {
    id: 'ord_005',
    orderNumber: '#AKS-1005',
    customer: 'Vjosa Mustafa',
    customerEmail: 'vjosa.m@gmail.com',
    items: [{ productId: 'prod_007', name: 'Elara Champagne Gown', quantity: 1, price: 265000 }],
    total: 265000,
    status: 'processing',
    fulfillment: 'partially_fulfilled',
    paymentMethod: 'Stripe',
    createdAt: '2026-02-03',
    shippingAddress: 'Rr. UCK 12, Peja, Kosovo',
  },
  {
    id: 'ord_006',
    orderNumber: '#AKS-1006',
    customer: 'Liridona Shala',
    customerEmail: 'liri.shala@gmail.com',
    items: [{ productId: 'prod_008', name: 'Luna Silver Ballgown', quantity: 1, price: 420000 }],
    total: 420000,
    status: 'pending',
    fulfillment: 'unfulfilled',
    paymentMethod: 'Stripe',
    createdAt: '2026-02-07',
    shippingAddress: 'Rr. Skanderbeu 5, Gjakova, Kosovo',
  },
  {
    id: 'ord_007',
    orderNumber: '#AKS-1007',
    customer: 'Blerta Ahmeti',
    customerEmail: 'blerta.a@yahoo.com',
    items: [
      { productId: 'prod_011', name: 'Ophelia Lace Cape Dress', quantity: 1, price: 358000 },
    ],
    total: 358000,
    status: 'shipped',
    fulfillment: 'fulfilled',
    paymentMethod: 'Stripe',
    createdAt: '2026-02-08',
    shippingAddress: 'Rr. Emin Duraku 30, Mitrovica, Kosovo',
  },
  {
    id: 'ord_008',
    orderNumber: '#AKS-1008',
    customer: 'Teuta Bytyqi',
    customerEmail: 'teuta.b@gmail.com',
    items: [{ productId: 'prod_012', name: 'Bianca Strapless Gown', quantity: 1, price: 198000 }],
    total: 198000,
    status: 'cancelled',
    fulfillment: 'unfulfilled',
    paymentMethod: 'Stripe',
    createdAt: '2026-02-09',
    shippingAddress: 'Rr. Fehmi Agani 18, Ferizaj, Kosovo',
  },
  {
    id: 'ord_009',
    orderNumber: '#AKS-1009',
    customer: 'Albana Rexhepi',
    customerEmail: 'albana.r@gmail.com',
    items: [{ productId: 'prod_005', name: 'Noir Velvet Evening Gown', quantity: 1, price: 195000 }],
    total: 195000,
    status: 'pending',
    fulfillment: 'unfulfilled',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-02-12',
    shippingAddress: 'Rr. Mbreteresha Teute 7, Durres, Albania',
  },
  {
    id: 'ord_010',
    orderNumber: '#AKS-1010',
    customer: 'Elona Berisha',
    customerEmail: 'elona.b@gmail.com',
    items: [{ productId: 'prod_003', name: 'Seraphina Evening Dress', quantity: 1, price: 178000 }],
    total: 178000,
    status: 'processing',
    fulfillment: 'unfulfilled',
    paymentMethod: 'Stripe',
    createdAt: '2026-02-14',
    shippingAddress: 'Rr. Agim Ramadani 42, Prishtina, Kosovo',
  },
]

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers: Customer[] = [
  {
    id: 'cust_001',
    name: 'Elona Berisha',
    email: 'elona.b@gmail.com',
    phone: '+383 44 123 456',
    totalOrders: 3,
    totalSpent: 641000,
    tags: ['VIP', 'Bridal'],
    joinedAt: '2025-08-10',
    lastOrderAt: '2026-02-14',
    spendingHistory: [
      { month: 'Sep 2025', amount: 0 },
      { month: 'Oct 2025', amount: 0 },
      { month: 'Nov 2025', amount: 178000 },
      { month: 'Dec 2025', amount: 0 },
      { month: 'Jan 2026', amount: 285000 },
      { month: 'Feb 2026', amount: 178000 },
    ],
  },
  {
    id: 'cust_002',
    name: 'Dafina Krasniqi',
    email: 'dafina.k@outlook.com',
    phone: '+383 44 234 567',
    totalOrders: 2,
    totalSpent: 523000,
    tags: ['VIP', 'Evening Wear'],
    joinedAt: '2025-09-22',
    lastOrderAt: '2026-01-18',
    spendingHistory: [
      { month: 'Oct 2025', amount: 150000 },
      { month: 'Nov 2025', amount: 0 },
      { month: 'Dec 2025', amount: 0 },
      { month: 'Jan 2026', amount: 373000 },
      { month: 'Feb 2026', amount: 0 },
    ],
  },
  {
    id: 'cust_003',
    name: 'Arta Hoxha',
    email: 'arta.h@gmail.com',
    phone: '+383 45 345 678',
    totalOrders: 1,
    totalSpent: 345000,
    tags: ['Bridal'],
    joinedAt: '2025-12-01',
    lastOrderAt: '2026-01-25',
    spendingHistory: [
      { month: 'Dec 2025', amount: 0 },
      { month: 'Jan 2026', amount: 345000 },
      { month: 'Feb 2026', amount: 0 },
    ],
  },
  {
    id: 'cust_004',
    name: 'Merita Gashi',
    email: 'merita.g@hotmail.com',
    phone: '+383 44 456 789',
    totalOrders: 1,
    totalSpent: 395000,
    tags: ['Bridal', 'Cape & Train'],
    joinedAt: '2026-01-15',
    lastOrderAt: '2026-02-01',
    spendingHistory: [
      { month: 'Jan 2026', amount: 0 },
      { month: 'Feb 2026', amount: 395000 },
    ],
  },
  {
    id: 'cust_005',
    name: 'Vjosa Mustafa',
    email: 'vjosa.m@gmail.com',
    phone: '+383 49 567 890',
    totalOrders: 1,
    totalSpent: 265000,
    tags: ['Bridal'],
    joinedAt: '2026-01-20',
    lastOrderAt: '2026-02-03',
    spendingHistory: [
      { month: 'Jan 2026', amount: 0 },
      { month: 'Feb 2026', amount: 265000 },
    ],
  },
  {
    id: 'cust_006',
    name: 'Liridona Shala',
    email: 'liri.shala@gmail.com',
    phone: '+383 44 678 901',
    totalOrders: 1,
    totalSpent: 420000,
    tags: ['VIP', 'Ball Gown'],
    joinedAt: '2026-01-28',
    lastOrderAt: '2026-02-07',
    spendingHistory: [
      { month: 'Jan 2026', amount: 0 },
      { month: 'Feb 2026', amount: 420000 },
    ],
  },
  {
    id: 'cust_007',
    name: 'Blerta Ahmeti',
    email: 'blerta.a@yahoo.com',
    phone: '+383 45 789 012',
    totalOrders: 2,
    totalSpent: 498000,
    tags: ['Cape & Train', 'Returning'],
    joinedAt: '2025-10-15',
    lastOrderAt: '2026-02-08',
    spendingHistory: [
      { month: 'Oct 2025', amount: 140000 },
      { month: 'Nov 2025', amount: 0 },
      { month: 'Dec 2025', amount: 0 },
      { month: 'Jan 2026', amount: 0 },
      { month: 'Feb 2026', amount: 358000 },
    ],
  },
  {
    id: 'cust_008',
    name: 'Teuta Bytyqi',
    email: 'teuta.b@gmail.com',
    phone: '+383 44 890 123',
    totalOrders: 1,
    totalSpent: 0,
    tags: ['Cancelled'],
    joinedAt: '2026-02-05',
    lastOrderAt: '2026-02-09',
    spendingHistory: [
      { month: 'Feb 2026', amount: 0 },
    ],
  },
  {
    id: 'cust_009',
    name: 'Albana Rexhepi',
    email: 'albana.r@gmail.com',
    phone: '+355 69 012 345',
    totalOrders: 1,
    totalSpent: 195000,
    tags: ['Evening Wear', 'International'],
    joinedAt: '2026-02-10',
    lastOrderAt: '2026-02-12',
    spendingHistory: [
      { month: 'Feb 2026', amount: 195000 },
    ],
  },
]

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export const dashboardMetrics: MetricData[] = [
  { label: 'Total Revenue', value: '€30,540', change: 12.5, changeLabel: 'vs last month' },
  { label: 'Total Orders', value: '10', change: 25.0, changeLabel: 'vs last month' },
  { label: 'Total Customers', value: '9', change: 18.2, changeLabel: 'vs last month' },
  { label: 'Avg. Order Value', value: '€3,054', change: -2.3, changeLabel: 'vs last month' },
]

// ─── Revenue Chart ────────────────────────────────────────────────────────────

export const revenueData: RevenueDataPoint[] = [
  { month: 'Mar', revenue: 185000, orders: 3 },
  { month: 'Apr', revenue: 245000, orders: 4 },
  { month: 'May', revenue: 310000, orders: 5 },
  { month: 'Jun', revenue: 178000, orders: 3 },
  { month: 'Jul', revenue: 425000, orders: 6 },
  { month: 'Aug', revenue: 290000, orders: 4 },
  { month: 'Sep', revenue: 365000, orders: 5 },
  { month: 'Oct', revenue: 440000, orders: 7 },
  { month: 'Nov', revenue: 520000, orders: 8 },
  { month: 'Dec', revenue: 380000, orders: 5 },
  { month: 'Jan', revenue: 1268000, orders: 5 },
  { month: 'Feb', revenue: 1786000, orders: 5 },
]

// ─── Category Sales ───────────────────────────────────────────────────────────

export const categorySales: CategorySalesPoint[] = [
  { name: 'Bridal Gowns', value: 45, fill: '#B8926A' },
  { name: 'Evening Dresses', value: 25, fill: '#C4A882' },
  { name: 'Ball Gowns', value: 18, fill: '#2D2D2D' },
  { name: 'Cape & Train', value: 12, fill: '#1a1a2e' },
]

// ─── Traffic Sources ──────────────────────────────────────────────────────────

export const trafficSources: TrafficSource[] = [
  { source: 'Instagram', visitors: 4250, conversion: 3.2 },
  { source: 'Google Search', visitors: 3180, conversion: 4.1 },
  { source: 'Direct', visitors: 2100, conversion: 5.8 },
  { source: 'Facebook', visitors: 1640, conversion: 2.4 },
  { source: 'TikTok', visitors: 980, conversion: 1.9 },
  { source: 'Referral', visitors: 520, conversion: 6.2 },
]

// ─── Analytics Extra Data ─────────────────────────────────────────────────────

export const dailyVisitors = [
  { date: 'Feb 1', visitors: 142, pageViews: 385 },
  { date: 'Feb 2', visitors: 128, pageViews: 342 },
  { date: 'Feb 3', visitors: 165, pageViews: 428 },
  { date: 'Feb 4', visitors: 189, pageViews: 512 },
  { date: 'Feb 5', visitors: 203, pageViews: 548 },
  { date: 'Feb 6', visitors: 178, pageViews: 465 },
  { date: 'Feb 7', visitors: 156, pageViews: 398 },
  { date: 'Feb 8', visitors: 210, pageViews: 578 },
  { date: 'Feb 9', visitors: 245, pageViews: 648 },
  { date: 'Feb 10', visitors: 198, pageViews: 518 },
  { date: 'Feb 11', visitors: 232, pageViews: 612 },
  { date: 'Feb 12', visitors: 267, pageViews: 698 },
  { date: 'Feb 13', visitors: 289, pageViews: 752 },
  { date: 'Feb 14', visitors: 312, pageViews: 825 },
]

export const conversionFunnel = [
  { stage: 'Visitors', count: 3054, pct: 100 },
  { stage: 'Product Views', count: 1842, pct: 60.3 },
  { stage: 'Add to Cart', count: 423, pct: 13.8 },
  { stage: 'Checkout', count: 178, pct: 5.8 },
  { stage: 'Purchase', count: 52, pct: 1.7 },
]

export const topPages = [
  { page: '/collections/bridal-gowns', views: 2840, bounceRate: 28.5 },
  { page: '/', views: 2450, bounceRate: 35.2 },
  { page: '/products/celestial-ivory', views: 1890, bounceRate: 22.1 },
  { page: '/collections/evening-dresses', views: 1560, bounceRate: 31.8 },
  { page: '/products/aurora-ball-gown', views: 1240, bounceRate: 24.3 },
  { page: '/about', views: 890, bounceRate: 45.6 },
  { page: '/contact', views: 720, bounceRate: 38.9 },
]

export const geoData = [
  { country: 'Kosovo', visitors: 5200, revenue: 1850000 },
  { country: 'Albania', visitors: 2800, revenue: 920000 },
  { country: 'Germany', visitors: 1400, revenue: 580000 },
  { country: 'Switzerland', visitors: 980, revenue: 450000 },
  { country: 'Turkey', visitors: 620, revenue: 180000 },
  { country: 'United States', visitors: 450, revenue: 120000 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
