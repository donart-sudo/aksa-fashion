"use client";

import { type ReactNode } from "react";

interface ArrayFieldProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (item: T) => void) => ReactNode;
  createItem: () => T;
  label?: string;
  addLabel?: string;
  maxItems?: number;
}

export default function ArrayField<T>({
  items,
  onChange,
  renderItem,
  createItem,
  label,
  addLabel = "Add item",
  maxItems,
}: ArrayFieldProps<T>) {
  const add = () => {
    if (maxItems && items.length >= maxItems) return;
    onChange([...items, createItem()]);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const update = (index: number, item: T) => {
    const next = [...items];
    next[index] = item;
    onChange(next);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  return (
    <div>
      {label && (
        <label className="block text-[11px] font-medium text-charcoal/60 tracking-wide uppercase mb-2">
          {label} ({items.length})
        </label>
      )}

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="relative border border-soft-gray/50 rounded p-3 bg-gray-50/50">
            {/* Item controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <button
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="p-1 text-charcoal/30 hover:text-charcoal/60 disabled:opacity-30 transition-colors"
                title="Move up"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <button
                onClick={() => moveDown(i)}
                disabled={i >= items.length - 1}
                className="p-1 text-charcoal/30 hover:text-charcoal/60 disabled:opacity-30 transition-colors"
                title="Move down"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => remove(i)}
                className="p-1 text-red-400/60 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="pr-20">
              {renderItem(item, i, (updated) => update(i, updated))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        disabled={!!maxItems && items.length >= maxItems}
        className="mt-3 flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-gold border border-dashed border-gold/30 rounded hover:bg-gold/5 transition-colors disabled:opacity-30"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {addLabel}
      </button>
    </div>
  );
}
