# Aksa Fashion — Project Guide

## Overview
Aksa Fashion is a luxury bridal and evening wear ecommerce platform based in Prishtina, Kosovo. Rebuilding ariart.shop as a modern, ultra-fast storefront with a Shopify-quality admin dashboard.

## Tech Stack
- **Frontend:** Next.js 15 (App Router, RSC, SSR/SSG) + TypeScript
- **Backend:** Medusa.js v2 (open-source headless ecommerce)
- **Database:** PostgreSQL (via Medusa)
- **Styling:** Tailwind CSS v4 + custom design tokens
- **Animations:** Framer Motion
- **Payments:** Stripe (via Medusa plugin)
- **Search:** Meilisearch (via Medusa plugin)
- **Images:** Next.js Image + Cloudinary (WebP/AVIF, lazy loading)
- **Hosting:** Vercel (frontend) + Railway (Medusa backend + DB)
- **Email:** Resend (transactional emails)
- **Analytics:** Google Analytics 4 + Facebook Pixel
- **i18n:** next-intl — Albanian (sq), English (en), Turkish (tr), Arabic (ar, RTL)

## Design System — Warm Luxury Minimal

### Color Palette
| Token        | Hex       | Usage                    |
|-------------|-----------|--------------------------|
| cream       | #FAF8F5   | Primary background       |
| warm-white  | #FFFFF7   | Card/section backgrounds |
| charcoal    | #2D2D2D   | Primary text             |
| gold        | #B8926A   | Accents, CTAs, highlights|
| rose        | #C4A882   | Secondary accents        |
| soft-gray   | #E8E5E0   | Borders, dividers        |

### Typography
- **Headings:** Playfair Display (serif) — elegant, editorial
- **Body:** Inter (sans-serif) — clean, readable
- **Scale:** Use Tailwind's type scale, headings start at text-3xl+

### Design Principles
- Generous whitespace — let content breathe
- Editorial feel — magazine-like layouts
- Serif elegance — Playfair Display for all headings
- LuceSposa + Noushella + Mohair aesthetic inspiration
- Mobile-first — app-like UX with bottom tab navigation
- Touch-optimized — minimum 44px tap targets

## Project Structure
```
aksa-fashion/
├── storefront/          # Next.js 15 frontend
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   │   └── [locale]/ # i18n locale prefix
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities, Medusa client
│   │   ├── hooks/       # Custom React hooks
│   │   ├── i18n/        # Translation files
│   │   ├── styles/      # Global styles
│   │   └── types/       # TypeScript types
│   └── public/          # Static assets
├── backend/             # Medusa.js v2 backend
│   └── src/
│       ├── admin/       # Admin customizations
│       ├── api/         # Custom API routes
│       ├── modules/     # Custom modules
│       └── workflows/   # Custom workflows
└── CLAUDE.md            # This file
```

## Languages
- **Albanian (sq)** — Default locale
- **English (en)**
- **Turkish (tr)**
- **Arabic (ar)** — RTL layout support required

## Key URLs
- **Current site:** ariart.shop
- **Staging:** aksa-fashion.vercel.app (Vercel)
- **Backend:** Railway deployment

## Development Commands
```bash
# Storefront
cd storefront && npm run dev    # Start dev server (port 3000)
cd storefront && npm run build  # Production build
cd storefront && npm run lint   # Run linter

# Backend
cd backend && npx medusa develop  # Start Medusa dev server
```

## Code Conventions
- Use TypeScript strict mode
- Prefer React Server Components where possible
- Use `'use client'` only when needed (interactivity, hooks)
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling — avoid inline styles
- Component files: PascalCase (e.g., `ProductCard.tsx`)
- Utility files: camelCase (e.g., `formatPrice.ts`)
- Keep components small and composable
- Use semantic HTML elements
- All images must have alt text
- Minimum 44px touch targets on interactive elements

## Brand Info
- **Brand:** Aksa Fashion
- **Location:** Prishtina, Kosovo
- **Focus:** Luxury bridal gowns, evening wear, haute couture
- **Target:** Brides and fashion-forward women in Kosovo, Albania, and diaspora
- **Tone:** Elegant, warm, aspirational but approachable
