"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
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
import AboutHeroEditor from "./sections/AboutHeroEditor";
import AboutCraftEditor from "./sections/AboutCraftEditor";
import AboutCtaEditor from "./sections/AboutCtaEditor";
import ContactHeroEditor from "./sections/ContactHeroEditor";
import ContactFormEditor from "./sections/ContactFormEditor";
import ContactSidebarEditor from "./sections/ContactSidebarEditor";
import ContactCtaEditor from "./sections/ContactCtaEditor";

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
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_CRAFT,
  DEFAULT_ABOUT_CTA,
  DEFAULT_CONTACT_HERO,
  DEFAULT_CONTACT_FORM,
  DEFAULT_CONTACT_SIDEBAR,
  DEFAULT_CONTACT_CTA,
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
    "page.about.hero": DEFAULT_ABOUT_HERO,
    "page.about.craft": DEFAULT_ABOUT_CRAFT,
    "page.about.cta": DEFAULT_ABOUT_CTA,
    "page.contact.hero": DEFAULT_CONTACT_HERO,
    "page.contact.form": DEFAULT_CONTACT_FORM,
    "page.contact.sidebar": DEFAULT_CONTACT_SIDEBAR,
    "page.contact.cta": DEFAULT_CONTACT_CTA,
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
  const router = useRouter();
  const { token, setLiveContent } = useStorefrontAdmin();
  const isI18n = isI18nSection(sectionKey);
  // For i18n sections, always use the current locale (override applies per-locale)
  const [locale, setLocale] = useState(isI18n ? currentLocale : currentLocale);
  const [content, setContent] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [settingUp, setSettingUp] = useState(false);

  // Check if content_blocks table exists on mount
  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/setup-editor", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.exists === false) setTableMissing(true);
      })
      .catch(() => {});
  }, [token]);

  const handleSetupTable = async () => {
    if (!token) return;
    setSettingUp(true);
    try {
      const res = await fetch("/api/admin/setup-editor", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setTableMissing(false);
        setError(null);
        // Re-fetch content now that the table exists
        fetchContent(locale);
      } else {
        setError(json.error || "Setup failed");
      }
    } catch {
      setError("Failed to connect to setup endpoint");
    }
    setSettingUp(false);
  };

  const fetchContent = useCallback(async (loc: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error: fetchError } = await supabase
        .from("content_blocks")
        .select("content")
        .eq("section_key", sectionKey)
        .eq("locale", loc)
        .eq("published", true)
        .single();

      if (fetchError && (fetchError.message?.includes("schema cache") || (fetchError.message?.includes("relation") && fetchError.message?.includes("does not exist")))) {
        setTableMissing(true);
      }

      setContent(data?.content || getDefaultContent(sectionKey));
    } catch {
      setContent(getDefaultContent(sectionKey));
    }
    setLoading(false);
  }, [sectionKey]);

  useEffect(() => {
    fetchContent(locale);
  }, [locale, fetchContent]);

  // Push live content to context for real-time preview (only for current locale)
  useEffect(() => {
    if (content && !loading && locale === currentLocale && !isI18n) {
      setLiveContent(sectionKey, content);
    }
  }, [content, loading, locale, currentLocale, sectionKey, setLiveContent, isI18n]);

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
      // Revalidate and refresh so server-rendered content updates
      fetch("/api/admin/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paths: ["/", "/about", "/contact"] }),
      })
        .then(() => router.refresh())
        .catch(() => router.refresh());
    } else {
      if (result.tableMissing) {
        setTableMissing(true);
      }
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
      case "page.about.hero": return <AboutHeroEditor {...props} />;
      case "page.about.craft": return <AboutCraftEditor {...props} />;
      case "page.about.cta": return <AboutCtaEditor {...props} />;
      case "page.contact.hero": return <ContactHeroEditor {...props} />;
      case "page.contact.form": return <ContactFormEditor {...props} />;
      case "page.contact.sidebar": return <ContactSidebarEditor {...props} />;
      case "page.contact.cta": return <ContactCtaEditor {...props} />;
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
      <div className="fixed top-0 right-0 bottom-0 z-[99999] w-full max-w-md bg-cream shadow-[-8px_0_30px_rgba(0,0,0,0.12)] flex flex-col animate-slide-in-right border-l border-soft-gray/40">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-soft-gray/50 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-medium text-gold uppercase tracking-[0.15em] mb-1">Editing</p>
              <h2 className="text-base font-semibold text-charcoal">{label}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-soft-gray/30 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-charcoal/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Locale tabs */}
          <div className="flex gap-1.5 bg-soft-gray/30 p-1 rounded-lg">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLocale(l.code)}
                className={`flex-1 px-3 py-1.5 text-xs font-semibold tracking-wide rounded-md transition-all cursor-pointer ${
                  locale === l.code
                    ? "bg-white text-charcoal shadow-sm"
                    : "text-charcoal/40 hover:text-charcoal/70"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {isI18n && (
            <p className="text-xs text-charcoal/40 mt-2.5 leading-relaxed">
              Editing <span className="font-medium text-charcoal/60">{LOCALES.find(l => l.code === locale)?.label || locale}</span> translations. Changes apply to this language only.
            </p>
          )}
        </div>

        {/* Setup banner */}
        {tableMissing && (
          <div className="flex-shrink-0 mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800 mb-1">Editor database table missing</p>
            <p className="text-xs text-amber-700 mb-3">
              The <code className="bg-amber-100 px-1 rounded">content_blocks</code> table hasn&apos;t been created yet. You can view defaults below, but saving is disabled until the table is set up.
            </p>
            <button
              onClick={handleSetupTable}
              disabled={settingUp}
              className="px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {settingUp ? "Setting up..." : "Set Up Now"}
            </button>
            <p className="text-[10px] text-amber-600 mt-2">
              Or run manually: <code className="bg-amber-100 px-1 rounded">npx tsx scripts/setup-content-blocks.ts</code>
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderEditor()}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t border-soft-gray/50 px-6 py-4">
          {error && (
            <p className="text-red-500 text-xs mb-2.5 font-medium">{error}</p>
          )}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-charcoal hover:bg-charcoal/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-soft-gray/60 text-charcoal/60 text-sm font-medium rounded-lg hover:bg-soft-gray/20 transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-charcoal/40 text-sm font-medium hover:text-charcoal/60 transition-colors cursor-pointer"
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
