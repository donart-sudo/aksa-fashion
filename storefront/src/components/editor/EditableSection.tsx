"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode, isValidElement, cloneElement, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { useStorefrontAdmin } from "@/lib/storefront-admin";
import type { SectionKey } from "@/types/content-blocks";
import EditDrawer from "./EditDrawer";

interface EditableSectionProps {
  sectionKey: SectionKey;
  label: string;
  children: ReactNode;
}

export default function EditableSection({ sectionKey, label, children }: EditableSectionProps) {
  const { editMode, liveContent, highlightedSection, setHighlightedSection } = useStorefrontAdmin();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [badgePos, setBadgePos] = useState({ top: 0, left: 0 });

  const isHighlighted = highlightedSection === sectionKey;

  // Scroll into view when this section becomes highlighted
  useEffect(() => {
    if (isHighlighted && wrapperRef.current) {
      wrapperRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      // Auto-clear highlight after 2.5s
      const timer = setTimeout(() => setHighlightedSection(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted, setHighlightedSection]);

  // Clear timer on unmount
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const show = useCallback((e?: React.MouseEvent) => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setHovered(true);
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      // Position badge near cursor Y, clamped within section bounds
      const mouseY = e ? e.clientY : rect.top + 8;
      const top = Math.max(rect.top + 4, Math.min(mouseY - 16, rect.bottom - 32));
      setBadgePos({ top, left: rect.left + rect.width / 2 });
    }
  }, []);

  const keepVisible = useCallback(() => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  const hide = useCallback(() => {
    hideTimer.current = setTimeout(() => setHovered(false), 400);
  }, []);

  // Inject live content into children if available
  const live = liveContent[sectionKey];
  let rendered: ReactNode = children;
  if (live && isValidElement(children)) {
    rendered = cloneElement(children as ReactElement<{ content?: unknown }>, { content: live });
  }

  if (!editMode) return <>{rendered}</>;

  const showOutline = hovered || isHighlighted;

  return (
    <div
      ref={wrapperRef}
      data-section-key={sectionKey}
      className="relative"
      onMouseEnter={(e) => show(e)}
      onMouseMove={(e) => { if (hovered && wrapperRef.current) { const rect = wrapperRef.current.getBoundingClientRect(); const top = Math.max(rect.top + 4, Math.min(e.clientY - 16, rect.bottom - 32)); setBadgePos({ top, left: rect.left + rect.width / 2 }); } }}
      onMouseLeave={hide}
    >
      {rendered}

      {/* Overlay outline — absolutely positioned ON TOP of all content */}
      {showOutline && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 9990,
            border: isHighlighted
              ? "2.5px solid rgba(184, 146, 106, 0.8)"
              : "2px dashed rgba(184, 146, 106, 0.55)",
            transition: "border-color 200ms ease, border-width 200ms ease",
          }}
        />
      )}

      {/* Floating label — portalled to body so it's never clipped by z-index */}
      {hovered && typeof document !== "undefined" &&
        createPortal(
          <button
            onMouseEnter={keepVisible}
            onMouseLeave={hide}
            onClick={() => setDrawerOpen(true)}
            style={{ top: badgePos.top, left: badgePos.left }}
            className="fixed z-[9999] flex items-center gap-1.5 px-3 py-1.5 bg-gold text-white text-[11px] font-medium tracking-wide rounded-full shadow-lg hover:bg-gold/90 transition-all cursor-pointer -translate-x-1/2 animate-[fadeInDown_150ms_ease-out]"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            {label}
          </button>,
          document.body
        )
      }

      {/* Drawer — portalled to body */}
      {drawerOpen && typeof document !== "undefined" &&
        createPortal(
          <EditDrawer
            sectionKey={sectionKey}
            label={label}
            onClose={() => setDrawerOpen(false)}
          />,
          document.body
        )
      }

      <style jsx>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
