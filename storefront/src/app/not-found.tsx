import Link from "next/link";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { SearchProvider } from "@/lib/search";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

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

export default async function RootNotFound() {
  const messages = (await import("@/i18n/messages/sq.json")).default;

  return (
    <html lang="sq">
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased bg-cream text-charcoal overflow-x-hidden`}
      >
        <NextIntlClientProvider locale="sq" messages={messages}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <SearchProvider>
                  <Header />
                  <main className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                      {/* Decorative line */}
                      <div className="flex items-center justify-center gap-4 mb-10">
                        <span className="h-px w-12 bg-gold/30" />
                        <span className="text-gold/60 text-[10px] tracking-[0.5em] uppercase">
                          Lost in Fabric
                        </span>
                        <span className="h-px w-12 bg-gold/30" />
                      </div>

                      {/* Large 404 */}
                      <h1 className="font-serif text-[8rem] sm:text-[10rem] lg:text-[12rem] leading-none text-charcoal/[0.04] font-bold select-none">
                        404
                      </h1>

                      {/* Overlapping heading */}
                      <div className="-mt-20 sm:-mt-24 lg:-mt-28 relative">
                        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
                          This Page Has
                          <br />
                          <span className="italic text-gold">
                            Slipped Away
                          </span>
                        </h2>
                        <p className="mt-5 text-charcoal/45 leading-relaxed max-w-md mx-auto text-[15px]">
                          The page you&apos;re looking for doesn&apos;t exist or
                          has been moved. Let&apos;s get you back to something
                          beautiful.
                        </p>
                      </div>

                      {/* CTAs */}
                      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                          href="/sq"
                          className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-charcoal text-white text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 min-w-[220px]"
                        >
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                            />
                          </svg>
                          Back to Home
                        </Link>
                        <Link
                          href="/sq/collections"
                          className="group inline-flex items-center justify-center gap-2 px-10 py-4 border border-charcoal/15 text-charcoal text-[11px] tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-all duration-500 min-w-[220px]"
                        >
                          Explore Collections
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </Link>
                      </div>

                      {/* Help line */}
                      <p className="mt-14 text-charcoal/30 text-xs tracking-wide">
                        Need help?{" "}
                        <a
                          href="https://wa.me/38349000000"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold/50 hover:text-gold transition-colors duration-300 underline underline-offset-2"
                        >
                          Chat with us on WhatsApp
                        </a>
                      </p>
                    </div>
                  </main>
                  <Footer />
                  <MobileNav />
                </SearchProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
