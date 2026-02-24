"use client";

import type { TrustBarContent, TrustBarItem } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";

interface Props {
  content: TrustBarContent;
  onChange: (c: TrustBarContent) => void;
}

const ICON_OPTIONS = [
  { value: "sparkles", label: "Sparkles" },
  { value: "measure", label: "Ruler / Measure" },
  { value: "globe", label: "Globe / Worldwide" },
  { value: "chat", label: "Chat / Support" },
];

export default function TrustBarEditor({ content, onChange }: Props) {
  return (
    <ArrayField<TrustBarItem>
      label="Trust Bar Items"
      items={content.items ?? []}
      onChange={(items) => onChange({ ...content, items })}
      addLabel="Add trust item"
      maxItems={6}
      createItem={() => ({ iconKey: "sparkles", textKey: "", text: "" })}
      renderItem={(item, _i, update) => (
        <div className="space-y-2">
          <div>
            <label className="block text-[11px] font-medium text-charcoal/60 tracking-wide uppercase mb-1.5">
              Icon
            </label>
            <select
              value={item.iconKey}
              onChange={(e) => update({ ...item, iconKey: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <EditorField
            label="Text"
            value={item.text || ""}
            onChange={(text) => update({ ...item, text, textKey: item.textKey || `trust${_i}` })}
            placeholder="e.g. Handcrafted Quality"
          />
        </div>
      )}
    />
  );
}
