# Aksa Fashion — Project Guide

## Overview
Aksa Fashion is a luxury bridal and evening wear ecommerce platform based in Prishtina, Kosovo. Rebuilding ariart.shop as a modern, ultra-fast storefront with a Shopify-quality admin dashboard.

## Tech Stack
- **Frontend:** Next.js 16 (App Router, RSC, SSR/SSG) + TypeScript
- **Backend:** Medusa.js v2.13.1 (open-source headless ecommerce)
- **Database:** PostgreSQL 17 (via Medusa)
- **Styling:** Tailwind CSS v4 + custom design tokens
- **Animations:** Framer Motion
- **Charts:** Recharts (admin dashboard)
- **Icons:** Lucide React (admin), Heroicons (storefront)
- **Payments:** Stripe (via Medusa plugin)
- **Images:** Next.js Image (ariart.shop hosted)
- **Hosting:** Vercel (frontend) + Railway (Medusa backend + DB)
- **i18n:** next-intl — Albanian (sq), English (en), Turkish (tr), Arabic (ar, RTL)

## Architecture

### Data Flow
- **Storefront pages** fetch from Medusa Store API (`/store/*`) using publishable API key
- **Admin dashboard** fetches from Medusa Admin API (`/admin/*`) using session cookies
- **Fallback:** All API calls fall back to static data if backend is unreachable
- **ISR:** Product pages revalidate every 60 seconds

### API Layers
- `src/lib/data/medusa-products.ts` — Server-side Store API (products, categories, search)
- `src/lib/admin-medusa.ts` — Client-side Admin API (products, orders, customers, store)
- `src/lib/data/products.ts` — Static fallback data (66 scraped products from ariart.shop)

### Authentication
- **Admin auth:** POST `/auth/user/emailpass` → JWT token → POST `/auth/session` → session cookie
- **Session cookies** are required for all `/admin/*` endpoints (Bearer tokens alone don't work)
- **Admin credentials:** admin@aksafashion.com / AksaAdmin123!
- **Demo mode:** Available on login page — uses sample data without backend connection

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
├── storefront/                    # Next.js 16 frontend
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
│   │   │   └── admin/             # Admin dashboard (Shopify-style)
│   │   │       ├── login/         # Admin login
│   │   │       └── (dashboard)/   # Dashboard pages
│   │   │           ├── page.tsx       # Home (metrics, charts, tables)
│   │   │           ├── products/      # Product management (CRUD)
│   │   │           ├── orders/        # Order management
│   │   │           ├── customers/     # Customer management
│   │   │           ├── analytics/     # Analytics dashboard
│   │   │           └── settings/      # Store settings
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
│   │   │   │   ├── medusa-products.ts  # Medusa Store API fetching
│   │   │   │   └── products.ts         # Static fallback data
│   │   │   ├── admin-medusa.ts    # Medusa Admin API client
│   │   │   ├── admin-auth.tsx     # Admin auth context/provider
│   │   │   ├── cart.tsx           # Cart context/provider
│   │   │   ├── auth.tsx           # Customer auth context
│   │   │   ├── wishlist.tsx       # Wishlist context
│   │   │   ├── search.tsx         # Search context
│   │   │   ├── medusa.ts          # Medusa SDK setup
│   │   │   ├── utils.ts           # formatPrice, slugify, cn
│   │   │   └── constants.ts       # Site config, social links
│   │   ├── data/
│   │   │   └── adminSampleData.ts # Demo data for admin dashboard
│   │   ├── i18n/                  # Translation files (sq, en, tr, ar)
│   │   └── types/                 # TypeScript interfaces
│   └── public/                    # Static assets, PWA manifest
├── backend/                       # Medusa.js v2 backend
│   └── src/
│       ├── scripts/seed.ts        # Seed 66 products, 7 categories, shipping
│       ├── admin/                 # Admin customizations
│       ├── api/                   # Custom API routes
│       └── workflows/             # Custom workflows
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
2. POST to `/auth/user/emailpass` → gets JWT token
3. POST to `/auth/session` with Bearer token → creates session cookie
4. All subsequent `/admin/*` requests use the session cookie (credentials: 'include')
5. On page reload, stored JWT is used to restore session

### Demo Mode
Login page has "Continue with demo data" — bypasses auth and uses `adminSampleData.ts`.

## Database
- **66 products** across 7 categories (Bridal, Ball Gown, Cape and Train, Evening Dress, Royal Over Train, Ruffled Dream, Silhouette Whisper)
- **567 inventory items** (50 units per variant)
- **Currencies:** EUR (default), USD, GBP
- **Countries:** Kosovo (XK), Albania, Germany, Austria, France, Italy, UK, Switzerland, Netherlands, Belgium
- **Shipping:** Standard (€15, 3-5 days), Express (€30, 1-2 days), Free (orders over €150)
- **Publishable API key:** Set in storefront `.env.local` as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`

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
- **Medusa admin (built-in):** http://localhost:9000/app

## Development Commands
```bash
# Start everything
cd backend && npm run dev          # Medusa backend (port 9000)
cd storefront && npm run dev       # Next.js frontend (port 3000)

# Database
cd backend && npx medusa db:migrate    # Run migrations
cd backend && npm run seed             # Seed 66 products

# Build & Deploy
cd storefront && npm run build         # Production build
cd storefront && vercel --prod --yes   # Deploy to Vercel

# Admin user
cd backend && npx medusa user --email admin@aksafashion.com --password AksaAdmin123!
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
- Prices: stored as whole EUR in Medusa, converted to cents (×100) for `formatPrice()` display

## Brand Info
- **Brand:** Aksa Fashion
- **Location:** Prishtina, Kosovo
- **Focus:** Luxury bridal gowns, evening wear, haute couture
- **Target:** Brides and fashion-forward women in Kosovo, Albania, and diaspora
- **Tone:** Elegant, warm, aspirational but approachable
