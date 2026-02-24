"use client";

import type { AnnouncementsContent } from "@/types/content-blocks";
import ArrayField from "../ArrayField";

interface Props {
  content: AnnouncementsContent;
  onChange: (c: AnnouncementsContent) => void;
}

export default function AnnouncementsEditor({ content, onChange }: Props) {
  return (
    <ArrayField<string>
      label="Announcement Messages"
      items={content.messages ?? []}
      onChange={(messages) => onChange({ ...content, messages })}
      addLabel="Add message"
      maxItems={8}
      createItem={() => ""}
      renderItem={(msg, _i, update) => (
        <input
          type="text"
          value={msg}
          onChange={(e) => update(e.target.value)}
          placeholder="Free shipping on orders over €150"
          className="w-full px-3 py-2 text-[13px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50"
        />
      )}
    />
  );
}
