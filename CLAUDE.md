# Aksa Fashion — Project Guide

## Overview
Aksa Fashion is a luxury bridal and evening wear ecommerce platform based in Prishtina, Kosovo. Rebuilding ariart.shop as a modern, ultra-fast storefront with a Shopify-quality admin dashboard.

## Tech Stack
- **Frontend:** Next.js 16 (App Router, RSC, SSR/SSG) + TypeScript
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage)
- **Styling:** Tailwind CSS v4 + custom design tokens
- **Animations:** Framer Motion
- **Charts:** Recharts (admin dashboard)
- **Icons:** Lucide React (admin), Heroicons (storefront)
- **Images:** Next.js Image (ariart.shop hosted + Supabase Storage)
- **Hosting:** Vercel (single deployment — no separate backend)
- **i18n:** next-intl — Albanian (sq), English (en), Turkish (tr), Arabic (ar, RTL)

## Architecture

### Data Flow
- **Storefront pages** query Supabase directly via `supabase-products.ts` (anon key, RLS-protected)
- **Admin dashboard** queries Supabase via `admin-supabase.ts` (authenticated session)
- **Fallback:** All storefront queries fall back to static data if Supabase is unreachable
- **ISR:** Product pages revalidate every 60 seconds

### Data Layers
- `src/lib/data/supabase-products.ts` — Server-side storefront queries (products, categories, search)
- `src/lib/admin-supabase.ts` — Client-side admin CRUD (products, orders, customers, collections, categories, promotions, tags, inventory)
- `src/lib/data/products.ts` — Static fallback data (66 scraped products from ariart.shop)

### Authentication
- **Admin auth:** Supabase Auth `signInWithPassword` → verify user exists in `admin_users` table
- **Session:** Supabase manages JWT sessions automatically (no manual cookie handling)
- **Admin credentials:** admin@aksafashion.com / AksaAdmin123!
- **Demo mode:** Available on login page — uses `adminSampleData.ts` without Supabase connection

### Supabase Clients
- `src/lib/supabase.ts` — Browser client (anon key)
- `src/lib/supabase-server.ts` — Server-side client (for RSC/API routes)
- `src/lib/supabase-admin.ts` — Service role client (for admin operations)

## Design System — Warm Luxury Minimal

### Storefront Palette
| Token        | Hex       | Usage                    |
|-------------|-----------|--------------------------|
| cream       | #FAF8F5   | Primary background       |
| warm-white  | #FFFFF7   | Card/section backgrounds |
| charcoal    | #2D2D2D   | Primary text             |
| gold        | #B8926A   | Accents, CTAs, highlights|
| rose        | #C4A882   | Secondary accents        |
| soft-gray   | #E8E5E0   | Borders, dividers        |

### Admin Dashboard Palette
| Token      | Hex       | Usage                |
|-----------|-----------|----------------------|
| page      | #f6f6f7   | Background           |
| card      | #ffffff   | Card surfaces        |
| nav       | #1a1a2e   | Sidebar background   |
| ink       | #303030   | Primary text         |
| ink-light | #616161   | Secondary text       |
| ink-faint | #8c9196   | Muted text           |
| edge      | #e1e3e5   | Borders              |
| accent    | #B8926A   | Gold brand accent    |

### Typography
- **Headings:** Playfair Display (serif) — elegant, editorial
- **Body:** Inter (sans-serif) — clean, readable
- **Admin:** System font stack — fast, professional

### Design Principles
- Generous whitespace — let content breathe
- Editorial feel — magazine-like layouts
- Serif elegance — Playfair Display for all headings
- Mobile-first — app-like UX with bottom tab navigation
- Touch-optimized — minimum 44px tap targets

## Project Structure
```
aksa-fashion/
├── storefront/                    # Next.js 16 frontend (single deployment)
│   ├── scripts/
│   │   ├── setup.ts               # Unified setup: schema + bucket + seed + admin
│   │   ├── schema.sql             # Database DDL (tables, indexes, RLS, search)
│   │   └── seed-supabase.ts       # Standalone seed script
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/          # i18n storefront pages
│   │   │   │   ├── (main)/        # Homepage
│   │   │   │   ├── products/      # Product detail pages
│   │   │   │   ├── collections/   # Collection & category pages
│   │   │   │   ├── search/        # Search page
│   │   │   │   ├── cart/          # Cart page
│   │   │   │   ├── checkout/      # Checkout flow
│   │   │   │   ├── account/       # Customer account
│   │   │   │   └── wishlist/      # Wishlist page
│   │   │   ├── admin/             # Admin dashboard (Shopify-style)
│   │   │   │   ├── login/         # Admin login
│   │   │   │   └── (dashboard)/   # Dashboard pages
│   │   │   │       ├── page.tsx       # Home (metrics, charts, tables)
│   │   │   │       ├── products/      # Product management (CRUD)
│   │   │   │       ├── orders/        # Order management
│   │   │   │       ├── customers/     # Customer management
│   │   │   │       ├── analytics/     # Analytics dashboard
│   │   │   │       └── settings/      # Store settings
│   │   │   └── api/               # Next.js API routes
│   │   ├── components/
│   │   │   ├── admin/             # Admin UI (Sidebar, TopBar, MetricCard, Badge, Modal)
│   │   │   ├── home/              # Hero, FeaturedCollections, NewArrivals, etc.
│   │   │   ├── product/           # ProductCard, RelatedProducts, StickyAddToCart
│   │   │   ├── collection/        # CollectionClient, FilterBar, FilterSheet
│   │   │   ├── search/            # SearchModal
│   │   │   ├── cart/              # CartDrawer
│   │   │   ├── layout/            # Header, Footer, MobileNav, ShopDropdown
│   │   │   └── ui/                # Button, Badge, Input, Skeleton
│   │   ├── lib/
│   │   │   ├── data/
│   │   │   │   ├── supabase-products.ts  # Supabase storefront queries
│   │   │   │   └── products.ts           # Static fallback data
│   │   │   ├── admin-supabase.ts  # Supabase admin CRUD client
│   │   │   ├── admin-auth.tsx     # Admin auth context/provider
│   │   │   ├── supabase.ts        # Browser Supabase client
│   │   │   ├── supabase-server.ts # Server-side Supabase client
│   │   │   ├── supabase-admin.ts  # Service role client
│   │   │   ├── cart.tsx           # Cart context/provider
│   │   │   ├── auth.tsx           # Customer auth context
│   │   │   ├── wishlist.tsx       # Wishlist context
│   │   │   ├── search.tsx         # Search context
│   │   │   ├── utils.ts           # formatPrice, slugify, cn
│   │   │   └── constants.ts       # Site config, social links
│   │   ├── data/
│   │   │   └── adminSampleData.ts # Demo data for admin dashboard
│   │   ├── i18n/                  # Translation files (sq, en, tr, ar)
│   │   └── types/                 # TypeScript interfaces
│   └── public/                    # Static assets, PWA manifest
└── CLAUDE.md                      # This file
```

## Admin Dashboard (Shopify-Style)
The admin lives at `/admin` and provides:
- **Home:** Revenue chart, category pie chart, recent orders table, top products
- **Products:** Full CRUD — add, edit, archive, delete. Filter by status, search by name/SKU
- **Orders:** Order list with status badges, filter by status, detail modal
- **Customers:** Customer list with spending history, tags (VIP, Bridal, etc.)
- **Analytics:** Revenue trends, traffic sources, conversion funnel, geographic data
- **Settings:** Store details, regional config, payment, notifications, appearance

### Admin Auth Flow
1. User enters email/password on `/admin/login`
2. Supabase Auth `signInWithPassword` → returns session with JWT
3. Verify user has a row in `admin_users` table (not just any auth user)
4. Supabase client stores session automatically (localStorage)
5. All subsequent queries use the authenticated session

### Demo Mode
Login page has "Continue with demo data" — bypasses auth and uses `adminSampleData.ts`.

## Database (Supabase)
- **66 products** across 7 categories (Bridal, Ball Gown, Cape and Train, Evening Dress, Royal Over Train, Ruffled Dream, Silhouette Whisper)
- **22 collections** for grouping products
- **~567 inventory items** (50 units per variant)
- **Currencies:** EUR (default), USD, GBP
- **Shipping:** Standard (€15, 3-5 days), Express (€30, 1-2 days), Free (orders over €150)
- **Full-text search:** PostgreSQL `tsvector` on product title + description
- **RLS policies:** Public read for storefront data, authenticated write for admin
- **Storage bucket:** `product-images` for uploaded product images

### Key Tables
`products`, `product_images`, `product_options`, `product_option_values`, `product_variants`, `categories`, `collections`, `product_categories`, `product_collections`, `product_tags`, `customers`, `customer_addresses`, `orders`, `order_items`, `shipping_options`, `promotions`, `admin_users`, `store_settings`

## Environment Variables
```bash
# storefront/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Languages
- **Albanian (sq)** — Default locale
- **English (en)**
- **Turkish (tr)**
- **Arabic (ar)** — RTL layout support

## Key URLs
- **Current site:** ariart.shop
- **Staging:** https://aksa-fashion.vercel.app
- **GitHub:** https://github.com/donart-sudo/aksa-fashion
- **Admin dashboard:** http://localhost:3000/admin
- **Supabase dashboard:** https://supabase.com/dashboard

## Development Commands
```bash
# First-time setup (creates tables, storage bucket, seeds data, creates admin user)
cd storefront && npm install && npm run setup

# Start dev server
cd storefront && npm run dev       # Next.js frontend (port 3000)

# Build & Deploy
cd storefront && npm run build         # Production build
cd storefront && vercel --prod --yes   # Deploy to Vercel

# Re-seed data only (without schema)
cd storefront && npx tsx scripts/seed-supabase.ts
```

## Code Conventions
- Use TypeScript strict mode
- Prefer React Server Components where possible
- Use `'use client'` only when needed (interactivity, hooks)
- Use `getTranslations()` from `next-intl/server` in async server components (NOT `useTranslations()`)
- Use `useTranslations()` only in client components
- Use Tailwind CSS for styling — avoid inline styles
- Component files: PascalCase (e.g., `ProductCard.tsx`)
- Utility files: camelCase (e.g., `formatPrice.ts`)
- Prices: stored as whole EUR in Supabase, converted to cents (x100) for `formatPrice()` display

## Brand Info
- **Brand:** Aksa Fashion
- **Location:** Prishtina, Kosovo
- **Focus:** Luxury bridal gowns, evening wear, haute couture
- **Target:** Brides and fashion-forward women in Kosovo, Albania, and diaspora
- **Tone:** Elegant, warm, aspirational but approachable

## Store Policies
- **No refunds / No returns:** All sales are final. Gowns are made-to-order and custom-fitted, so refunds and returns are not offered. Do NOT display "free returns", "return policy", or any refund-related messaging anywhere on the storefront. Trust/confidence badges should instead highlight: handcrafted quality, made-to-measure, worldwide shipping, and personal styling service via WhatsApp.
- **Shipping:** Standard (€15, 3-5 days), Express (€30, 1-2 days), Free on orders over €150
- **Made to order:** 2-5 business days production time
- **Custom alterations:** Available upon request
