"use client";

import type { NewsletterContent, NewsletterImage } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";
import ImageUploader from "../ImageUploader";
import FieldGroup from "../FieldGroup";

interface Props {
  content: NewsletterContent;
  onChange: (c: NewsletterContent) => void;
}

export default function NewsletterEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <FieldGroup label="Section Text">
        <EditorField
          label="Heading"
          value={content.heading || ""}
          onChange={(heading) => onChange({ ...content, heading })}
          placeholder="e.g. Stay in the World of Aksa"
        />
        <EditorField
          label="Subtitle"
          value={content.subtitle || ""}
          onChange={(subtitle) => onChange({ ...content, subtitle })}
          placeholder="e.g. Be the first to know..."
          type="textarea"
          rows={2}
        />
        <EditorField
          label="Button Text"
          value={content.buttonText || ""}
          onChange={(buttonText) => onChange({ ...content, buttonText })}
          placeholder="e.g. Subscribe"
        />
        <EditorField
          label="Placeholder"
          value={content.placeholder || ""}
          onChange={(placeholder) => onChange({ ...content, placeholder })}
          placeholder="e.g. Enter your email"
        />
      </FieldGroup>

    <ArrayField<NewsletterImage>
      label="Marquee Images"
      items={content.marqueeImages ?? []}
      onChange={(marqueeImages) => onChange({ ...content, marqueeImages })}
      addLabel="Add image"
      maxItems={16}
      createItem={() => ({ src: "", alt: "" })}
      renderItem={(img, _i, update) => (
        <div className="space-y-2">
          <ImageUploader label="Image" value={img.src} onChange={(src) => update({ ...img, src })} />
          <EditorField label="Alt Text" value={img.alt} onChange={(alt) => update({ ...img, alt })} />
        </div>
      )}
    />
    </div>
  );
}
