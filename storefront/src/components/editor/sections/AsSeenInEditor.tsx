"use client";

import type { AsSeenInContent } from "@/types/content-blocks";
import ArrayField from "../ArrayField";

interface Props {
  content: AsSeenInContent;
  onChange: (c: AsSeenInContent) => void;
}

export default function AsSeenInEditor({ content, onChange }: Props) {
  return (
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
  );
}
