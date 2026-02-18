import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Cormorant_Garamond } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { routing } from "@/i18n/routing";
import { isRtl, locales, type Locale } from "@/i18n/config";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/constants";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { SearchProvider } from "@/lib/search";
import { AuthProvider } from "@/lib/auth";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { ToastProvider } from "@/components/ui/Toast";

export const viewport: Viewport = {
  viewportFit: "cover",
  maximumScale: 1,
  themeColor: "#B8926A",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  const title = {
    default: `${SITE_NAME} — ${t("tagline")}`,
    template: `%s | ${SITE_NAME}`,
  };

  const description = SITE_DESCRIPTION;
  const url = `${SITE_URL}/${locale}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
    openGraph: {
      title: `${SITE_NAME} — ${t("tagline")}`,
      description,
      url,
      siteName: SITE_NAME,
      locale,
      type: "website",
      images: [
        {
          url: "http://localhost:9000/static/1771434664999-Crystal-Bloom-1-scaled.jpg",
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Luxury Bridal & Evening Wear`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — ${t("tagline")}`,
      description,
      images: ["http://localhost:9000/static/1771434664999-Crystal-Bloom-1-scaled.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const rtl = isRtl(locale as Locale);

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Aksa Fashion" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased bg-cream text-charcoal overflow-x-hidden`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <SearchProvider>
                  <ToastProvider>
                    <Header />
                    <main className="min-h-screen animate-page-fade-in">{children}</main>
                    <Footer />
                    <MobileNav />
                    <CartDrawer />
                    <WhatsAppButton />
                  </ToastProvider>
                </SearchProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}`,
          }}
        />
      </body>
    </html>
  );
}
