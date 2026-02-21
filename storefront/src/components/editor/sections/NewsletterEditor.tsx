"use client";

import type { NewsletterContent, NewsletterImage } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";
import ImageUploader from "../ImageUploader";

interface Props {
  content: NewsletterContent;
  onChange: (c: NewsletterContent) => void;
}

export default function NewsletterEditor({ content, onChange }: Props) {
  return (
    <ArrayField<NewsletterImage>
      label="Marquee Images"
      items={content.marqueeImages}
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
  );
}
