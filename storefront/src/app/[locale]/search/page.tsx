"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Input from "@/components/ui/Input";

export default function SearchPage() {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-8 text-center">
        {t.raw("placeholder").replace("...", "")}
      </h1>

      <div className="max-w-xl mx-auto mb-12">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
          <Input
            type="search"
            placeholder={t("placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12"
          />
        </div>
      </div>

      {query && (
        <p className="text-center text-charcoal/60">
          {t("noResults", { query })}
        </p>
      )}
    </div>
  );
}
