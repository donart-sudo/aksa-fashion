import { getTranslations } from "next-intl/server";
import {
  fetchCategories,
  fetchProductsForCards,
  fetchNewProductsForCards,
  fetchSaleProductsForCards,
  fetchProductsByCategoryForCards,
} from "@/lib/data/supabase-products";
import CollectionClient from "@/components/collection/CollectionClient";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}) {
  const { handle, locale } = await params;
  const t = await getTranslations();

  const titleMap: Record<string, string> = {
    all: t("common.collections"),
    bridal: t("nav.bridalGowns"),
    evening: t("nav.eveningWear"),
    accessories: t("nav.accessories"),
    new: t("nav.newCollection"),
    sale: t("nav.saleItems"),
    "cape-and-train-elegance": t("nav.capeAndTrain"),
    "ball-gown": t("nav.ballGown"),
    "royal-over-train": t("nav.royalOverTrain"),
    "ruffled-dream": t("nav.ruffledDream"),
    "silhouette-whisper": t("nav.silhouetteWhisper"),
    "evening-dress": t("nav.eveningDress"),
  };

  const title =
    titleMap[handle] ||
    handle
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  let filteredProducts;
  switch (handle) {
    case "new":
      filteredProducts = await fetchNewProductsForCards();
      break;
    case "sale":
      filteredProducts = await fetchSaleProductsForCards();
      break;
    case "all":
      filteredProducts = await fetchProductsForCards();
      break;
    default:
      filteredProducts = await fetchProductsByCategoryForCards(handle);
      if (filteredProducts.length === 0) {
        filteredProducts = await fetchProductsForCards();
      }
      break;
  }

  return (
    <CollectionClient
      products={filteredProducts}
      title={title}
      locale={locale}
    />
  );
}
