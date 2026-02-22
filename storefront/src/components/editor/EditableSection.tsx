"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
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
  const { editMode } = useStorefrontAdmin();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [badgePos, setBadgePos] = useState({ top: 0, left: 0 });

  // Clear timer on unmount
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const show = useCallback(() => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setHovered(true);
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setBadgePos({ top: rect.top + 8, left: rect.left + rect.width / 2 });
    }
  }, []);

  const hide = useCallback(() => {
    // Delay hide so user can reach the portalled badge
    hideTimer.current = setTimeout(() => setHovered(false), 250);
  }, []);

  if (!editMode) return <>{children}</>;

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{
        outline: hovered ? "2px dashed rgba(184, 146, 106, 0.55)" : "2px dashed transparent",
        outlineOffset: "-2px",
        transition: "outline-color 200ms ease",
      }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}

      {/* Floating label — portalled to body so it's never clipped by z-index */}
      {hovered && typeof document !== "undefined" &&
        createPortal(
          <button
            onMouseEnter={show}
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
