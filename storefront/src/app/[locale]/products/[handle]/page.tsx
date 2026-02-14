import { notFound } from "next/navigation";
import {
  fetchProduct,
  fetchProductHandles,
  fetchProductsByCategoryForCards,
  fetchNewProductsForCards,
} from "@/lib/data/medusa-products";
import ProductDetail from "./ProductDetail";
import RelatedProducts from "@/components/product/RelatedProducts";

export async function generateStaticParams() {
  const handles = await fetchProductHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}) {
  const { handle } = await params;
  const product = await fetchProduct(handle);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Aksa Fashion`,
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
  const product = await fetchProduct(handle);

  if (!product) {
    notFound();
  }

  // Fetch related products from same category
  let related;
  const category = product.categories[0];
  if (category) {
    const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
    related = await fetchProductsByCategoryForCards(categorySlug);
    // Filter out current product
    related = related.filter((p) => p.handle !== product.slug).slice(0, 4);
  }

  // If not enough related products, fill with new arrivals
  if (!related || related.length < 2) {
    const newProducts = await fetchNewProductsForCards(6);
    related = newProducts
      .filter((p) => p.handle !== product.slug)
      .slice(0, 4);
  }

  return (
    <>
      <ProductDetail product={product} />
      <RelatedProducts products={related} />
    </>
  );
}
