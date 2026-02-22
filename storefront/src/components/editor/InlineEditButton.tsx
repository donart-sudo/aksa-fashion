"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useStorefrontAdmin } from "@/lib/storefront-admin";
import type { SectionKey } from "@/types/content-blocks";
import EditDrawer from "./EditDrawer";

interface InlineEditButtonProps {
  sectionKey: SectionKey;
  label: string;
  /** Positioning classes, e.g. "top-1 right-1" */
  className?: string;
}

/**
 * Small inline edit pill for areas inside complex components (Header, Footer).
 * Shows a tiny pencil icon that opens the EditDrawer on click.
 */
export default function InlineEditButton({ sectionKey, label, className = "" }: InlineEditButtonProps) {
  const { editMode } = useStorefrontAdmin();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!editMode) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDrawerOpen(true);
        }}
        className={`z-[9991] inline-flex items-center gap-1 px-2 py-1 bg-gold/90 text-white text-[9px] font-medium tracking-wider uppercase rounded-full shadow-md hover:bg-gold transition-all cursor-pointer ${className}`}
        title={`Edit ${label}`}
      >
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
        {label}
      </button>

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
    </>
  );
}
