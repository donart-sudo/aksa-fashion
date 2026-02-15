import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  fetchCategories,
  fetchProductsForCards,
  fetchNewProductsForCards,
  fetchSaleProductsForCards,
  fetchProductsByCategoryForCards,
  fetchProductsByCategory,
} from "@/lib/data/medusa-products";
import CollectionClient from "@/components/collection/CollectionClient";

export async function generateStaticParams() {
  const categories = await fetchCategories();
  const staticHandles = categories.map((c) => ({ handle: c.handle }));
  staticHandles.push({ handle: "new" }, { handle: "sale" }, { handle: "all" });
  return staticHandles;
}

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

  // Extract available sizes and colors for filters
  let allSizes: string[] = [];
  let allColors: string[] = [];
  try {
    const rawProducts =
      handle === "new" || handle === "all"
        ? (await import("@/lib/data/products")).products
        : await fetchProductsByCategory(handle);

    const productList = Array.isArray(rawProducts) ? rawProducts : [];
    const sizeSet = new Set<string>();
    const colorSet = new Set<string>();
    productList.forEach((p: { sizes?: string[]; colors?: string[] }) => {
      p.sizes?.forEach((s: string) => sizeSet.add(s));
      p.colors?.forEach((c: string) => colorSet.add(c));
    });
    allSizes = Array.from(sizeSet);
    allColors = Array.from(colorSet);
  } catch {
    allSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[11px] text-charcoal/40 pt-6 pb-4 tracking-wide">
        <Link
          href={`/${locale}`}
          className="hover:text-charcoal transition-colors"
        >
          {t("common.home")}
        </Link>
        <span className="text-charcoal/20">/</span>
        <Link
          href={`/${locale}/collections`}
          className="hover:text-charcoal transition-colors"
        >
          {t("common.collections")}
        </Link>
        <span className="text-charcoal/20">/</span>
        <span className="text-charcoal font-medium">{title}</span>
      </nav>

      {/* Header */}
      <div className="text-center pt-4 pb-8 lg:pb-10">
        <h1 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] font-black uppercase tracking-tight text-charcoal leading-none">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/35 tracking-wide mt-3">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? t("common.product")
            : t("common.products")}
        </p>
      </div>

      {/* Content */}
      <div className="pb-8 lg:pb-12">
        <CollectionClient
          products={filteredProducts}
          allSizes={allSizes}
          allColors={allColors}
        />
      </div>
    </div>
  );
}
