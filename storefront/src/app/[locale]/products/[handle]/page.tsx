import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/lib/data/products";
import ProductDetail from "./ProductDetail";

export async function generateStaticParams() {
  return products.map((p) => ({ handle: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}) {
  const { handle } = await params;
  const product = getProductBySlug(handle);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Aksa Fashion`,
      description: product.description,
      images: [{ url: product.images[0], width: 800, height: 1067 }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}) {
  const { handle } = await params;
  const product = getProductBySlug(handle);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
