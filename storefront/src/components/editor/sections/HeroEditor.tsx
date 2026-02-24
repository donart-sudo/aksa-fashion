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
      items={content.slides ?? []}
      onChange={(slides) => onChange({ ...content, slides })}
      addLabel="Add slide"
      maxItems={8}
      createItem={() => ({
        image: "",
        alt: "",
        ctaLink: "collections",
        key: `slide${content.slides.length}`,
        buttonText: "",
        buttonSecondaryText: "",
        buttonSecondaryLink: "",
      })}
      renderItem={(slide, _i, update) => (
        <div className="space-y-3">
          <ImageUploader
            label="Slide Image"
            value={slide.image}
            onChange={(image) => update({ ...slide, image })}
          />
          <EditorField label="Alt Text" value={slide.alt} onChange={(alt) => update({ ...slide, alt })} />

          {/* Slide Text */}
          <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
            <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Slide Text</p>
            <EditorField
              label="Subtitle"
              value={slide.subtitle || ""}
              onChange={(subtitle) => update({ ...slide, subtitle })}
              placeholder="e.g. New Collection 2025"
            />
            <EditorField
              label="Title Line 1"
              value={slide.title1 || ""}
              onChange={(title1) => update({ ...slide, title1 })}
              placeholder="e.g. Elegance"
            />
            <EditorField
              label="Title Line 2"
              value={slide.title2 || ""}
              onChange={(title2) => update({ ...slide, title2 })}
              placeholder="e.g. Redefined"
            />
            <EditorField
              label="Description"
              value={slide.description || ""}
              onChange={(description) => update({ ...slide, description })}
              placeholder="Slide description text"
              type="textarea"
              rows={2}
            />
            <EditorField
              label="CTA Button Text"
              value={slide.ctaText || ""}
              onChange={(ctaText) => update({ ...slide, ctaText })}
              placeholder="e.g. Discover Now"
            />
          </div>

          {/* Primary Button */}
          <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
            <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Primary Button</p>
            <EditorField
              label="Button Text"
              value={slide.buttonText || ""}
              onChange={(buttonText) => update({ ...slide, buttonText })}
              placeholder="e.g. Shop Collection"
            />
            <EditorField
              label="Button Link"
              value={slide.ctaLink}
              onChange={(ctaLink) => update({ ...slide, ctaLink })}
              placeholder="/collections/bridal or https://example.com"
            />
          </div>

          {/* Secondary Button */}
          <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
            <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Secondary Button (optional)</p>
            <EditorField
              label="Button Text"
              value={slide.buttonSecondaryText || ""}
              onChange={(buttonSecondaryText) => update({ ...slide, buttonSecondaryText })}
              placeholder="e.g. View Bridal"
            />
            <EditorField
              label="Button Link"
              value={slide.buttonSecondaryLink || ""}
              onChange={(buttonSecondaryLink) => update({ ...slide, buttonSecondaryLink })}
              placeholder="/collections/bridal or https://example.com"
            />
          </div>

        </div>
      )}
    />
  );
}
