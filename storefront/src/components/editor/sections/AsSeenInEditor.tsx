"use client";

import type { AsSeenInContent } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";

interface Props {
  content: AsSeenInContent;
  onChange: (c: AsSeenInContent) => void;
}

export default function AsSeenInEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Section Text */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Section Text</p>
        <EditorField
          label="Section Heading"
          value={content.heading || ""}
          onChange={(heading) => onChange({ ...content, heading })}
          placeholder="e.g. As Seen In"
        />
      </div>

    <ArrayField<string>
      label="Press Names"
      items={content.names}
      onChange={(names) => onChange({ ...content, names })}
      addLabel="Add press name"
      maxItems={10}
      createItem={() => ""}
      renderItem={(name, _i, update) => (
        <input
          type="text"
          value={name}
          onChange={(e) => update(e.target.value)}
          placeholder="e.g. Vogue Sposa"
          className="w-full px-3 py-2 text-[13px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50"
        />
      )}
    />
    </div>
  );
}
