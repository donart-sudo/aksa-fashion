export interface StoreSettingsData {
  // Store Details
  storeName: string
  legalName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  description: string
  timezone: string

  // Brand
  logoUrl: string
  primaryColor: string
  accentColor: string
  socialInstagram: string
  socialFacebook: string
  socialTiktok: string
  socialWhatsapp: string

  // Payments
  paymentBankTransfer: boolean
  paymentCashPickup: boolean
  paymentWesternUnion: boolean
  paymentWhatsapp: boolean
  defaultCurrency: string
  acceptedCurrencies: string[]

  // Checkout
  guestCheckout: boolean
  requirePhone: boolean
  orderNotes: boolean
  autoConfirm: boolean

  // Shipping
  freeShippingThreshold: number
  standardRate: number
  standardDays: string
  expressRate: number
  expressDays: string
  processingTime: string

  // Taxes
  taxEnabled: boolean
  taxRate: number
  taxIncludedInPrices: boolean
  taxId: string

  // Notifications
  notifyNewOrder: boolean
  notifyShipped: boolean
  notifyDelivered: boolean
  notifyLowStock: boolean
  senderName: string
  senderEmail: string
  notifyWhatsapp: boolean

  // Languages
  primaryLanguage: string
  activeLanguages: string[]

  // Policies
  termsOfService: string
  privacyPolicy: string
  shippingPolicy: string
}

export const DEFAULT_SETTINGS: StoreSettingsData = {
  // Store Details
  storeName: 'Aksa Fashion',
  legalName: 'Aksa Fashion L.L.C.',
  email: 'info@aksafashion.com',
  phone: '+383 44 000 000',
  address: 'Rr. Nena Tereze 25',
  city: 'Prishtina',
  postalCode: '10000',
  country: 'Kosovo',
  description: 'Luxury bridal gowns, evening wear, and haute couture based in Prishtina, Kosovo.',
  timezone: 'Europe/Belgrade',

  // Brand
  logoUrl: '',
  primaryColor: '#2D2D2D',
  accentColor: '#B8926A',
  socialInstagram: '',
  socialFacebook: '',
  socialTiktok: '',
  socialWhatsapp: '',

  // Payments
  paymentBankTransfer: true,
  paymentCashPickup: true,
  paymentWesternUnion: false,
  paymentWhatsapp: true,
  defaultCurrency: 'EUR',
  acceptedCurrencies: ['EUR', 'USD', 'GBP'],

  // Checkout
  guestCheckout: true,
  requirePhone: true,
  orderNotes: true,
  autoConfirm: false,

  // Shipping
  freeShippingThreshold: 150,
  standardRate: 15,
  standardDays: '3-5',
  expressRate: 30,
  expressDays: '1-2',
  processingTime: '2-5 business days',

  // Taxes
  taxEnabled: true,
  taxRate: 18,
  taxIncludedInPrices: true,
  taxId: '',

  // Notifications
  notifyNewOrder: true,
  notifyShipped: true,
  notifyDelivered: true,
  notifyLowStock: true,
  senderName: 'Aksa Fashion',
  senderEmail: 'orders@aksa-fashion.com',
  notifyWhatsapp: false,

  // Languages
  primaryLanguage: 'sq',
  activeLanguages: ['sq', 'en', 'tr', 'ar'],

  // Policies
  termsOfService: '',
  privacyPolicy: '',
  shippingPolicy: '',
}

export function settingsToMetadata(settings: StoreSettingsData): Record<string, unknown> {
  return { ...settings }
}

export function metadataToSettings(metadata: Record<string, unknown> | null): StoreSettingsData {
  if (!metadata) return { ...DEFAULT_SETTINGS }
  return { ...DEFAULT_SETTINGS, ...metadata } as StoreSettingsData
}

export interface AdminUser {
  id: string
  email: string
  role: string
  created_at: string
}
