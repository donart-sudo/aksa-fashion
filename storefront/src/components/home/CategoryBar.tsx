import Link from "next/link";
import { getTranslations } from "next-intl/server";

const QUICK_LINKS = [
  { key: "all", handle: "all" },
  { key: "new", handle: "new" },
  { key: "bridal", handle: "bridal" },
  { key: "evening", handle: "evening-dress" },
  { key: "ball", handle: "ball-gown" },
  { key: "sale", handle: "sale" },
];

export default async function CategoryBar({ locale }: { locale: string }) {
  const t = await getTranslations();

  const labels: Record<string, string> = {
    all: t("common.collections"),
    new: t("nav.newCollection"),
    bridal: t("nav.bridalGowns"),
    evening: t("nav.eveningWear"),
    ball: t("nav.ballGown"),
    sale: t("nav.saleItems"),
  };

  return (
    <section className="relative border-b border-soft-gray/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 py-4 overflow-x-auto scrollbar-hide lg:justify-center lg:gap-0">
          {QUICK_LINKS.map((link, i) => (
            <span key={link.handle} className="flex items-center flex-shrink-0">
              {i > 0 && (
                <span className="hidden lg:inline-block text-soft-gray mx-4 select-none">
                  /
                </span>
              )}
              <Link
                href={`/${locale}/collections/${link.handle}`}
                className={`relative px-3 py-1.5 text-xs font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap ${
                  link.key === "sale"
                    ? "text-red-500 hover:text-red-600"
                    : link.key === "new"
                      ? "text-gold font-semibold hover:text-gold-dark"
                      : "text-charcoal/70 hover:text-charcoal"
                } group`}
              >
                {labels[link.key]}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] w-0 bg-charcoal group-hover:w-full transition-all duration-400" />
              </Link>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
