"use client";

import type { EditorialBandContent } from "@/types/content-blocks";
import ImageUploader from "../ImageUploader";
import EditorField from "../EditorField";

interface Props {
  content: EditorialBandContent;
  onChange: (c: EditorialBandContent) => void;
}

export default function EditorialBandEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <ImageUploader
        label="Editorial Band Image"
        value={content.image}
        onChange={(image) => onChange({ ...content, image })}
      />
      <EditorField
        label="Alt Text"
        value={content.alt}
        onChange={(alt) => onChange({ ...content, alt })}
      />

      {/* Section Text */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Section Text</p>
        <EditorField
          label="Top Label"
          value={content.topLabel || ""}
          onChange={(topLabel) => onChange({ ...content, topLabel })}
          placeholder="e.g. Aksa Fashion — Est. Prishtina"
        />
        <EditorField
          label="Heading"
          value={content.heading || ""}
          onChange={(heading) => onChange({ ...content, heading })}
          placeholder="e.g. Where Dreams Take Shape"
        />
        <EditorField
          label="Tagline"
          value={content.tagline || ""}
          onChange={(tagline) => onChange({ ...content, tagline })}
          placeholder="e.g. Handcrafted elegance..."
        />
        <EditorField
          label="Button Text"
          value={content.buttonText || ""}
          onChange={(buttonText) => onChange({ ...content, buttonText })}
          placeholder="e.g. Discover Our Story"
        />
        <EditorField
          label="Button Link"
          value={content.buttonLink || ""}
          onChange={(buttonLink) => onChange({ ...content, buttonLink })}
          placeholder="e.g. /collections"
        />
      </div>
    </div>
  );
}
