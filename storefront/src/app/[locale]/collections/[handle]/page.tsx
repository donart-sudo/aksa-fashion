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
      <nav className="flex items-center gap-2 text-xs text-charcoal/50 pt-6 pb-4 tracking-wide">
        <Link
          href={`/${locale}`}
          className="hover:text-charcoal transition-colors"
        >
          {t("common.home")}
        </Link>
        <span className="text-charcoal/25">/</span>
        <Link
          href={`/${locale}/collections`}
          className="hover:text-charcoal transition-colors"
        >
          {t("common.collections")}
        </Link>
        <span className="text-charcoal/25">/</span>
        <span className="text-charcoal font-medium">{title}</span>
      </nav>

      {/* Editorial header */}
      <div className="pb-8 lg:pb-10 border-b border-soft-gray/40">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
              {title}
            </h1>
            <p className="text-sm text-charcoal/60 mt-2">
              {filteredProducts.length} {filteredProducts.length === 1 ? t("common.product") : t("common.products")}
            </p>
          </div>
          <span className="hidden sm:block h-[2px] w-12 bg-gold mb-3" />
        </div>
      </div>

      {/* Content */}
      <div className="py-6 lg:py-8">
        <CollectionClient
          products={filteredProducts}
          allSizes={allSizes}
          allColors={allColors}
        />
      </div>
    </div>
  );
}
