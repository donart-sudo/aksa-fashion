import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aksa Fashion — Luxury Bridal & Evening Wear",
    template: "%s | Aksa Fashion",
  },
  description:
    "Luxury bridal gowns and evening wear from Prishtina, Kosovo. Handcrafted elegance for your most precious moments.",
  metadataBase: new URL("https://aksafashion.com"),
  openGraph: {
    type: "website",
    siteName: "Aksa Fashion",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
