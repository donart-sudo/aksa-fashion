import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Bag",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
