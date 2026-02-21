"use client";

import { useState, type ReactNode } from "react";
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

  if (!editMode) return <>{children}</>;

  return (
    <div className="relative">
      {/* Edit button — pinned top-right, always visible in edit mode */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="absolute top-3 right-3 z-[9991] flex items-center gap-1.5 px-3 py-1.5 bg-gold text-white text-[11px] font-medium tracking-wide rounded shadow-lg hover:bg-gold-dark transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
        Edit {label}
      </button>

      {children}

      {/* Portal the drawer to document.body so fixed positioning works correctly */}
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
    </div>
  );
}
