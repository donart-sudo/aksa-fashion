"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

interface FilterBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  activeFilters: { key: string; value: string }[];
  onRemoveFilter: (key: string, value?: string) => void;
  onClearAll: () => void;
  onOpenFilters: () => void;
  totalCount: number;
}

export default function FilterBar({
  sortBy,
  onSortChange,
  activeFilters,
  onRemoveFilter,
  onClearAll,
  onOpenFilters,
  totalCount,
}: FilterBarProps) {
  const t = useTranslations("common");

  return (
    <div className="space-y-3 mb-6 lg:mb-8">
      <div className="flex items-center justify-between py-3 border-b border-soft-gray/40">
        <div className="flex items-center gap-4">
          {/* Mobile filter trigger */}
          <button
            onClick={onOpenFilters}
            className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-charcoal/70 transition-colors md:hidden min-h-[44px]"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            {t("filters")}
            {activeFilters.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-charcoal text-white text-[10px] font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Product count */}
          <span className="text-sm text-charcoal/50">
            {totalCount} {totalCount === 1 ? t("product") : t("products")}
          </span>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-charcoal/40 uppercase tracking-wider">
            {t("sortBy")}
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm font-medium text-charcoal bg-transparent border-none cursor-pointer focus:outline-none pr-6"
          >
            <option value="newest">{t("newest")}</option>
            <option value="price-asc">{t("priceLowToHigh")}</option>
            <option value="price-desc">{t("priceHighToLow")}</option>
            <option value="name-asc">{t("nameAZ")}</option>
          </select>
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <button
              key={`${filter.key}-${filter.value}`}
              onClick={() => onRemoveFilter(filter.key, filter.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-charcoal/5 text-charcoal text-xs font-medium tracking-wide border border-charcoal/10 hover:bg-charcoal/10 transition-colors"
            >
              {filter.value}
              <XMarkIcon className="w-3.5 h-3.5 text-charcoal/40" />
            </button>
          ))}
          <button
            onClick={onClearAll}
            className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-4 transition-colors ml-1"
          >
            {t("clearAll")}
          </button>
        </div>
      )}
    </div>
  );
}
