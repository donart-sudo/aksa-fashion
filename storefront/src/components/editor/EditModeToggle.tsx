"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useStorefrontAdmin } from "@/lib/storefront-admin";
import type { SectionKey } from "@/types/content-blocks";
import EditDrawer from "./EditDrawer";

/* ── Section definitions organized into 3 categories ── */

interface SectionItem {
  key: SectionKey;
  label: string;
}

const VISUAL_SECTIONS: SectionItem[] = [
  { key: "homepage.hero", label: "Hero Slides" },
  { key: "homepage.trustbar", label: "Trust Bar" },
  { key: "homepage.editorial-band", label: "Editorial Band" },
  { key: "homepage.featured-collections", label: "Featured Collections" },
  { key: "homepage.appointment", label: "Appointment CTA" },
  { key: "homepage.testimonials", label: "Testimonials" },
  { key: "homepage.as-seen-in", label: "As Seen In" },
  { key: "homepage.newsletter", label: "Newsletter" },
  { key: "layout.announcements", label: "Announcements" },
  { key: "layout.footer", label: "Footer Links" },
  { key: "site.constants", label: "Site Config" },
  { key: "page.faq", label: "FAQ" },
  { key: "page.terms", label: "Terms" },
  { key: "page.privacy", label: "Privacy" },
  { key: "page.about.hero", label: "About Hero" },
  { key: "page.about.craft", label: "About Craft & Values" },
  { key: "page.about.cta", label: "About Atelier & CTA" },
  { key: "page.contact.hero", label: "Contact Hero" },
  { key: "page.contact.form", label: "Contact Form" },
  { key: "page.contact.sidebar", label: "Contact Sidebar" },
  { key: "page.contact.cta", label: "Contact CTAs" },
];

const GLOBAL_TEXT: SectionItem[] = [
  { key: "i18n.topBar", label: "Top Bar" },
  { key: "i18n.common", label: "Common Labels" },
  { key: "i18n.nav", label: "Navigation" },
  { key: "i18n.footer", label: "Footer Text" },
  { key: "i18n.search", label: "Search" },
];

const PAGE_TEXT: SectionItem[] = [
  { key: "i18n.home", label: "Homepage" },
  { key: "i18n.product", label: "Product Page" },
  { key: "i18n.cart", label: "Cart" },
  { key: "i18n.checkout", label: "Checkout" },
  { key: "i18n.account", label: "Account" },
  { key: "i18n.order", label: "Orders" },
  { key: "i18n.orderTracking", label: "Order Tracking" },
];

const ALL_CATEGORIES = [
  { title: "Visual Sections", items: VISUAL_SECTIONS, icon: "layout" },
  { title: "Global Text", items: GLOBAL_TEXT, icon: "type" },
  { title: "Page Text", items: PAGE_TEXT, icon: "file" },
] as const;

export default function EditModeToggle() {
  const { isAdmin, editMode, setEditMode, setHighlightedSection } = useStorefrontAdmin();
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionItem | null>(null);
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return ALL_CATEGORIES;
    const q = search.toLowerCase();
    return ALL_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  if (!isAdmin) return null;

  const handleSectionClick = (item: SectionItem) => {
    // Scroll to + highlight the section on the page
    const el = document.querySelector(`[data-section-key="${item.key}"]`);
    if (el) {
      setHighlightedSection(item.key);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setActiveSection(item);
    setPanelOpen(false);
    setSearch("");
  };

  const categoryIcon = (type: string) => {
    switch (type) {
      case "layout":
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        );
      case "type":
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        );
      case "file":
        return (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed bottom-24 left-4 z-[99999] flex flex-col items-start gap-2">
        {/* Comprehensive panel */}
        {panelOpen && (
          <div className="bg-white border border-soft-gray rounded-xl shadow-2xl w-[280px] max-h-[70vh] flex flex-col animate-fade-in overflow-hidden">
            {/* Panel header */}
            <div className="px-4 pt-3.5 pb-2.5 border-b border-soft-gray/50 flex-shrink-0">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[13px] font-semibold text-charcoal tracking-wide">Content Editor</h3>
                <button
                  onClick={() => { setPanelOpen(false); setSearch(""); }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-soft-gray/50 rounded-lg bg-gray-50 focus:outline-none focus:border-gold/50 transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto py-2">
              {filteredCategories.map((category) => (
                <div key={category.title} className="mb-1">
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <span className="text-charcoal/25">{categoryIcon(category.icon)}</span>
                    <span className="text-[9px] font-semibold text-charcoal/35 tracking-[0.15em] uppercase">
                      {category.title}
                    </span>
                    <span className="text-[9px] text-charcoal/20">{category.items.length}</span>
                  </div>
                  {category.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleSectionClick(item)}
                      className="w-full text-left px-4 py-2 text-[12px] text-charcoal/65 hover:bg-gold/[0.06] hover:text-gold transition-colors flex items-center justify-between group"
                    >
                      <span className="pl-5">{item.label}</span>
                      <svg className="w-3 h-3 text-charcoal/10 group-hover:text-gold/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  ))}
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <p className="text-center text-[12px] text-charcoal/30 py-6">No sections match &ldquo;{search}&rdquo;</p>
              )}
            </div>
          </div>
        )}

        {/* Main buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (editMode) {
                setEditMode(false);
                setPanelOpen(false);
                setSearch("");
              } else {
                setEditMode(true);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl text-[12px] font-medium tracking-wide transition-all duration-300 ${
              editMode
                ? "bg-gold text-white shadow-gold/30"
                : "bg-white text-charcoal border border-soft-gray hover:border-gold hover:shadow-md"
            }`}
            title={editMode ? "Exit edit mode" : "Edit website content"}
          >
            {editMode ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Exit Edit
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit
              </>
            )}
          </button>

          {editMode && (
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full shadow-xl text-[12px] font-medium transition-all duration-300 ${
                panelOpen
                  ? "bg-gold text-white shadow-gold/30"
                  : "bg-white text-charcoal border border-soft-gray hover:border-gold hover:shadow-md"
              }`}
              title="Browse all editable sections"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              All Sections
            </button>
          )}
        </div>
      </div>

      {activeSection && typeof document !== "undefined" &&
        createPortal(
          <EditDrawer
            sectionKey={activeSection.key}
            label={activeSection.label}
            onClose={() => setActiveSection(null)}
          />,
          document.body
        )
      }

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
