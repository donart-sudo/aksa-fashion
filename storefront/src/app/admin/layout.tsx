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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
