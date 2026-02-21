"use client";

import { useTranslations } from "next-intl";
import { DEFAULT_FAQ } from "@/lib/data/content-defaults";
import type { FAQContent } from "@/types/content-blocks";
import EditableSection from "@/components/editor/EditableSection";

const defaultFaqs = DEFAULT_FAQ.items;

export default function FAQPage() {
  const t = useTranslations("home");

  return (
    <EditableSection sectionKey="page.faq" label="FAQ">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-4 text-center">
          {t("faqTitle")}
        </h1>
        <p className="text-charcoal/60 text-center mb-12">
          {DEFAULT_FAQ.subtitle}
        </p>

        <div className="space-y-4">
          {defaultFaqs.map((faq, i) => (
            <details
              key={i}
              className="group border border-soft-gray/50 bg-white"
            >
              <summary className="flex items-center justify-between cursor-pointer p-5 text-charcoal font-medium">
                {faq.q}
                <span className="text-gold ml-4 text-xl group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-charcoal/60 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </EditableSection>
  );
}
