"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useStorefrontAdmin } from "@/lib/storefront-admin";
import type { SectionKey } from "@/types/content-blocks";
import EditDrawer from "./EditDrawer";

const GLOBAL_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "layout.announcements", label: "Announcements" },
  { key: "layout.footer", label: "Footer" },
  { key: "site.constants", label: "Site Config" },
  { key: "page.faq", label: "FAQ" },
  { key: "page.terms", label: "Terms" },
  { key: "page.privacy", label: "Privacy" },
];

export default function EditModeToggle() {
  const { isAdmin, editMode, setEditMode } = useStorefrontAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<{ key: SectionKey; label: string } | null>(null);

  if (!isAdmin) return null;

  return (
    <>
      <div className="fixed bottom-24 left-4 z-[99999] flex flex-col items-start gap-2">
        {/* Section menu */}
        {menuOpen && (
          <div className="bg-white border border-soft-gray rounded-lg shadow-2xl p-2 min-w-[180px] animate-fade-in">
            <p className="text-[10px] font-medium text-charcoal/40 tracking-wider uppercase px-2 py-1">
              Global Sections
            </p>
            {GLOBAL_SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setActiveSection(s);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[13px] text-charcoal/70 hover:bg-gold/5 hover:text-gold rounded transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Main buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
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
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-full shadow-xl text-[12px] font-medium bg-white text-charcoal border border-soft-gray hover:border-gold hover:shadow-md transition-all duration-300"
              title="Edit global sections"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              More
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
