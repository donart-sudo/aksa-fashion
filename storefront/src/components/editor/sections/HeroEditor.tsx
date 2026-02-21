"use client";

import type { HeroContent, HeroSlide } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";
import ImageUploader from "../ImageUploader";

interface Props {
  content: HeroContent;
  onChange: (c: HeroContent) => void;
}

export default function HeroEditor({ content, onChange }: Props) {
  return (
    <ArrayField<HeroSlide>
      label="Hero Slides"
      items={content.slides}
      onChange={(slides) => onChange({ ...content, slides })}
      addLabel="Add slide"
      maxItems={8}
      createItem={() => ({ image: "", alt: "", ctaLink: "collections", key: `slide${content.slides.length}` })}
      renderItem={(slide, _i, update) => (
        <div className="space-y-2">
          <ImageUploader
            label="Slide Image"
            value={slide.image}
            onChange={(image) => update({ ...slide, image })}
          />
          <EditorField label="Alt Text" value={slide.alt} onChange={(alt) => update({ ...slide, alt })} />
          <EditorField label="CTA Link" value={slide.ctaLink} onChange={(ctaLink) => update({ ...slide, ctaLink })} placeholder="collections/bridal" />
          <EditorField label="Key (i18n)" value={slide.key} onChange={(key) => update({ ...slide, key })} placeholder="slide0" />
        </div>
      )}
    />
  );
}
