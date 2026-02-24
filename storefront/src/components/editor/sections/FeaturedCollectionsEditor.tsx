"use client";

import type { FeaturedCollectionsContent, FeaturedCollectionItem } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";
import ImageUploader from "../ImageUploader";

interface Props {
  content: FeaturedCollectionsContent;
  onChange: (c: FeaturedCollectionsContent) => void;
}

export default function FeaturedCollectionsEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Section Text */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Section Text</p>
        <EditorField
          label="Section Label"
          value={content.label || ""}
          onChange={(label) => onChange({ ...content, label })}
          placeholder="e.g. Our Collections"
        />
        <EditorField
          label="Heading"
          value={content.heading || ""}
          onChange={(heading) => onChange({ ...content, heading })}
          placeholder="e.g. Shop by Category"
        />
      </div>

    <ArrayField<FeaturedCollectionItem>
      label="Collections"
      items={content.collections ?? []}
      onChange={(collections) => onChange({ ...content, collections })}
      addLabel="Add collection"
      maxItems={8}
      createItem={() => ({ key: `col${content.collections.length}`, title: "", image: "", href: "/collections/" })}
      renderItem={(item, _i, update) => (
        <div className="space-y-2">
          <EditorField
            label="Title"
            value={item.title || ""}
            onChange={(title) => update({ ...item, title, key: item.key || `col${_i}` })}
            placeholder="e.g. Bridal Gowns"
          />
          <ImageUploader label="Cover Image" value={item.image} onChange={(image) => update({ ...item, image })} />
          <EditorField label="Link" value={item.href} onChange={(href) => update({ ...item, href })} placeholder="/collections/bridal or https://example.com" />
        </div>
      )}
    />
    </div>
  );
}
