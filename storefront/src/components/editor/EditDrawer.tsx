"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { useStorefrontAdmin } from "@/lib/storefront-admin";
import { saveContentBlock } from "@/lib/data/content-blocks-client";
import type { SectionKey, SectionContentMap } from "@/types/content-blocks";
import { createClient } from "@supabase/supabase-js";

// Section editors
import HeroEditor from "./sections/HeroEditor";
import TrustBarEditor from "./sections/TrustBarEditor";
import EditorialBandEditor from "./sections/EditorialBandEditor";
import FeaturedCollectionsEditor from "./sections/FeaturedCollectionsEditor";
import AppointmentEditor from "./sections/AppointmentEditor";
import TestimonialsEditor from "./sections/TestimonialsEditor";
import AsSeenInEditor from "./sections/AsSeenInEditor";
import NewsletterEditor from "./sections/NewsletterEditor";
import FAQEditor from "./sections/FAQEditor";
import LegalEditor from "./sections/LegalEditor";
import AnnouncementsEditor from "./sections/AnnouncementsEditor";
import FooterEditor from "./sections/FooterEditor";
import SiteConstantsEditor from "./sections/SiteConstantsEditor";
import TranslationGroupEditor from "./sections/TranslationGroupEditor";

// Default content
import {
  DEFAULT_HERO,
  DEFAULT_TRUSTBAR,
  DEFAULT_EDITORIAL_BAND,
  DEFAULT_FEATURED_COLLECTIONS,
  DEFAULT_APPOINTMENT,
  DEFAULT_TESTIMONIALS,
  DEFAULT_AS_SEEN_IN,
  DEFAULT_NEWSLETTER,
  DEFAULT_FAQ,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_FOOTER,
  DEFAULT_SITE_CONSTANTS,
} from "@/lib/data/content-defaults";

const LOCALES = [
  { code: "sq", label: "SQ" },
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
  { code: "ar", label: "AR" },
] as const;

function isI18nSection(key: string): boolean {
  return key.startsWith("i18n.");
}

function getDefaultContent(sectionKey: SectionKey): unknown {
  if (isI18nSection(sectionKey)) {
    return { overrides: {} };
  }
  const defaults: Record<string, unknown> = {
    "homepage.hero": DEFAULT_HERO,
    "homepage.trustbar": DEFAULT_TRUSTBAR,
    "homepage.editorial-band": DEFAULT_EDITORIAL_BAND,
    "homepage.featured-collections": DEFAULT_FEATURED_COLLECTIONS,
    "homepage.appointment": DEFAULT_APPOINTMENT,
    "homepage.testimonials": DEFAULT_TESTIMONIALS,
    "homepage.as-seen-in": DEFAULT_AS_SEEN_IN,
    "homepage.newsletter": DEFAULT_NEWSLETTER,
    "page.faq": DEFAULT_FAQ,
    "page.terms": { sections: [] },
    "page.privacy": { sections: [] },
    "layout.announcements": DEFAULT_ANNOUNCEMENTS,
    "layout.footer": DEFAULT_FOOTER,
    "site.constants": DEFAULT_SITE_CONSTANTS,
  };
  return defaults[sectionKey] || {};
}

interface EditDrawerProps {
  sectionKey: SectionKey;
  label: string;
  onClose: () => void;
}

export default function EditDrawer({ sectionKey, label, onClose }: EditDrawerProps) {
  const currentLocale = useLocale();
  const { token } = useStorefrontAdmin();
  const isI18n = isI18nSection(sectionKey);
  // For i18n sections, always use the current locale (override applies per-locale)
  const [locale, setLocale] = useState(isI18n ? currentLocale : currentLocale);
  const [content, setContent] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async (loc: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from("content_blocks")
        .select("content")
        .eq("section_key", sectionKey)
        .eq("locale", loc)
        .eq("published", true)
        .single();

      setContent(data?.content || getDefaultContent(sectionKey));
    } catch {
      setContent(getDefaultContent(sectionKey));
    }
    setLoading(false);
  }, [sectionKey]);

  useEffect(() => {
    fetchContent(locale);
  }, [locale, fetchContent]);

  const handleSave = async () => {
    if (!token || !content) return;
    setSaving(true);
    setError(null);

    const result = await saveContentBlock(
      sectionKey,
      locale,
      content as SectionContentMap[typeof sectionKey],
      token
    );

    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Trigger ISR revalidation for i18n changes (affects all pages)
      if (isI18n && token) {
        fetch("/api/admin/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paths: ["/"] }),
        }).catch(() => {});
      }
    } else {
      setError(result.error || "Failed to save");
    }
  };

  const handleReset = () => {
    setContent(getDefaultContent(sectionKey));
  };

  const renderEditor = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      );
    }

    const props = {
      content: content as never,
      onChange: setContent as never,
    };

    switch (sectionKey) {
      case "homepage.hero": return <HeroEditor {...props} />;
      case "homepage.trustbar": return <TrustBarEditor {...props} />;
      case "homepage.editorial-band": return <EditorialBandEditor {...props} />;
      case "homepage.featured-collections": return <FeaturedCollectionsEditor {...props} />;
      case "homepage.appointment": return <AppointmentEditor {...props} />;
      case "homepage.testimonials": return <TestimonialsEditor {...props} />;
      case "homepage.as-seen-in": return <AsSeenInEditor {...props} />;
      case "homepage.newsletter": return <NewsletterEditor {...props} />;
      case "page.faq": return <FAQEditor {...props} />;
      case "page.terms":
      case "page.privacy": return <LegalEditor {...props} />;
      case "layout.announcements": return <AnnouncementsEditor {...props} />;
      case "layout.footer": return <FooterEditor {...props} />;
      case "site.constants": return <SiteConstantsEditor {...props} />;
      default: {
        // Handle i18n.* sections
        if (isI18nSection(sectionKey)) {
          const namespace = sectionKey.replace("i18n.", "");
          return (
            <TranslationGroupEditor
              namespace={namespace}
              content={content as import("@/types/content-blocks").TranslationOverrideContent}
              onChange={setContent as (c: import("@/types/content-blocks").TranslationOverrideContent) => void}
            />
          );
        }
        return <p className="text-sm text-charcoal/50 p-4">No editor available for this section.</p>;
      }
    }
  };

  return (
    <>
      {/* Drawer — no backdrop, non-blocking side panel */}
      <div className="fixed top-0 right-0 bottom-0 z-[99999] w-full max-w-md bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.15)] flex flex-col animate-slide-in-right border-l border-soft-gray/30">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-soft-gray/50 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-charcoal">Edit: {label}</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-charcoal/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Locale tabs — show for all sections */}
          <div className="flex gap-1">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLocale(l.code)}
                className={`px-3 py-1.5 text-[11px] font-medium tracking-wider rounded transition-colors ${
                  locale === l.code
                    ? "bg-gold text-white"
                    : "bg-gray-100 text-charcoal/50 hover:text-charcoal hover:bg-gray-200"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {isI18n && (
            <p className="text-[10px] text-charcoal/35 mt-1.5">
              Editing translation overrides for {LOCALES.find(l => l.code === locale)?.label || locale}. Changes apply to this language only.
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderEditor()}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-soft-gray/50 px-6 py-4">
          {error && (
            <p className="text-red-500 text-[12px] mb-2">{error}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold/90 text-white text-[12px] font-medium tracking-wide rounded transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-soft-gray text-charcoal/60 text-[12px] font-medium tracking-wide rounded hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-charcoal/40 text-[12px] font-medium tracking-wide hover:text-charcoal/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
