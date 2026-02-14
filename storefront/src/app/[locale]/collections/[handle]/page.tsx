import { useTranslations } from "next-intl";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import {
  getProductsByCategory,
  getProductsForCards,
  getNewProducts,
  getSaleProducts,
  categories,
} from "@/lib/data/products";

export async function generateStaticParams() {
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
  const t = useTranslations();

  const titleMap: Record<string, string> = {
    all: t("common.collections"),
    bridal: t("nav.bridalGowns"),
    evening: t("nav.eveningWear"),
    accessories: t("nav.accessories"),
    new: t("nav.newCollection"),
    sale: t("nav.saleItems"),
    "cape-and-train-elegance": "Cape and Train Elegance",
    "ball-gown": "Ball Gown",
    "royal-over-train": "Royal Over Train",
    "ruffled-dream": "Ruffled Dream",
    "silhouette-whisper": "Silhouette Whisper",
    "evening-dress": "Evening Dress",
  };

  const title =
    titleMap[handle] ||
    handle
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  // Get filtered products based on collection handle
  let filteredProducts;
  switch (handle) {
    case "new":
      filteredProducts = getNewProducts();
      break;
    case "sale":
      filteredProducts = getSaleProducts();
      break;
    case "all":
      filteredProducts = getProductsForCards();
      break;
    default:
      filteredProducts = getProductsByCategory(handle);
      // Fallback to all products if category not found
      if (filteredProducts.length === 0) {
        filteredProducts = getProductsForCards();
      }
      break;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="text-xs text-charcoal/40 mb-8 tracking-wider uppercase">
        <Link
          href={`/${locale}`}
          className="hover:text-charcoal transition-colors"
        >
          {t("common.home")}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/${locale}/collections`}
          className="hover:text-charcoal transition-colors"
        >
          {t("common.collections")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{title}</span>
      </nav>

      <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-4">
        {title}
      </h1>
      <p className="text-charcoal/60 mb-8">
        {filteredProducts.length}{" "}
        {filteredProducts.length === 1 ? "product" : "products"}
      </p>

      {/* Filters bar */}
      <div className="flex items-center justify-between border-b border-soft-gray/50 pb-4 mb-8">
        <div className="flex gap-4">
          <button className="text-xs tracking-wider uppercase text-charcoal/60 hover:text-charcoal transition-colors">
            {t("common.size")}
          </button>
          <button className="text-xs tracking-wider uppercase text-charcoal/60 hover:text-charcoal transition-colors">
            {t("common.color")}
          </button>
        </div>
        <select className="text-xs tracking-wider uppercase text-charcoal/60 bg-transparent border-none cursor-pointer">
          <option>Sort by</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest</option>
        </select>
      </div>

      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-charcoal/40 text-lg">
            No products found in this collection.
          </p>
          <Link
            href={`/${locale}/collections/all`}
            className="inline-block mt-4 text-gold hover:text-gold-dark text-sm tracking-wider uppercase transition-colors"
          >
            View all products →
          </Link>
        </div>
      )}
    </div>
  );
}
