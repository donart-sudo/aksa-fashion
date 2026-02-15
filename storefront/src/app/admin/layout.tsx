import type { Metadata } from "next";
import "./admin.css";
import { AdminAuthProvider } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: {
    default: "Admin — Aksa Fashion",
    template: "%s | Admin — Aksa Fashion",
  },
  description: "Aksa Fashion admin dashboard",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="admin-html">
      <body className="admin-body">
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
