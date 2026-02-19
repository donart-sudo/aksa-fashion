import {
  fetchCategories,
  fetchProductsByCategory,
} from "@/lib/data/supabase-products";
import CollectionsShowcase from "@/components/collection/CollectionsShowcase";

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  const categories = await fetchCategories();

  const displayCategories = await Promise.all(
    categories.map(async (cat) => {
      const products = await fetchProductsByCategory(cat.handle);
      const images = products
        .flatMap((p) => p.images)
        .filter(Boolean);
      return {
        handle: cat.handle,
        title: cat.title,
        image: images[0] || "",
        secondImage: images[1] || "",
        count: products.length,
      };
    })
  );

  return <CollectionsShowcase categories={displayCategories} />;
}
