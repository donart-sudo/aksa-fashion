"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth";
import Sidebar from "@/components/admin/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, authed } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authed) {
      router.replace("/admin/login");
    }
  }, [ready, authed, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full skeleton" />
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden bg-[#f6f6f7]">
        {children}
      </main>
    </div>
  );
}
