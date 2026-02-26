"use client";

import type { EditorialBandContent } from "@/types/content-blocks";
import ImageUploader from "../ImageUploader";
import EditorField from "../EditorField";
import FieldGroup from "../FieldGroup";
import LinkField from "../LinkField";

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

      <FieldGroup label="Section Text">
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
        <LinkField
          label="Button Link"
          value={content.buttonLink || ""}
          onChange={(buttonLink) => onChange({ ...content, buttonLink })}
          placeholder="/collections or https://example.com"
        />
      </FieldGroup>
    </div>
  );
}
