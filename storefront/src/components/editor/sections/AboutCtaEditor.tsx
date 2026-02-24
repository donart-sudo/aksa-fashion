"use client";

import type { AboutCtaContent } from "@/types/content-blocks";
import ImageUploader from "../ImageUploader";
import EditorField from "../EditorField";
import ArrayField from "../ArrayField";

interface Props {
  content: AboutCtaContent;
  onChange: (c: AboutCtaContent) => void;
}

export default function AboutCtaEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Atelier Section */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Atelier</p>
        <EditorField label="Label" value={content.atelierLabel} onChange={(atelierLabel) => onChange({ ...content, atelierLabel })} />
        <EditorField label="Heading" value={content.atelierHeading} onChange={(atelierHeading) => onChange({ ...content, atelierHeading })} />
        <EditorField label="Heading Accent" value={content.atelierHeadingAccent} onChange={(atelierHeadingAccent) => onChange({ ...content, atelierHeadingAccent })} />
        <ArrayField<string>
          label="Paragraphs"
          items={content.atelierParagraphs ?? []}
          onChange={(atelierParagraphs) => onChange({ ...content, atelierParagraphs })}
          addLabel="Add Paragraph"
          createItem={() => ""}
          renderItem={(text, _i, update) => (
            <EditorField label={`Paragraph ${_i + 1}`} value={text} onChange={update} type="textarea" rows={3} />
          )}
        />
        <ImageUploader
          label="Atelier Image"
          value={content.atelierImage}
          onChange={(atelierImage) => onChange({ ...content, atelierImage })}
        />
        <EditorField label="Atelier Image Alt" value={content.atelierImageAlt} onChange={(atelierImageAlt) => onChange({ ...content, atelierImageAlt })} />
      </div>

      {/* Promise Section */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Promise</p>
        <EditorField label="Label" value={content.promiseLabel} onChange={(promiseLabel) => onChange({ ...content, promiseLabel })} />
        <EditorField label="Heading" value={content.promiseHeading} onChange={(promiseHeading) => onChange({ ...content, promiseHeading })} />
        <EditorField label="Heading Accent" value={content.promiseHeadingAccent} onChange={(promiseHeadingAccent) => onChange({ ...content, promiseHeadingAccent })} />
        <EditorField label="Paragraph" value={content.promiseParagraph} onChange={(promiseParagraph) => onChange({ ...content, promiseParagraph })} type="textarea" rows={3} />
      </div>

      {/* CTA Buttons */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">CTA Buttons</p>
        <EditorField label="Primary Text" value={content.ctaPrimaryText} onChange={(ctaPrimaryText) => onChange({ ...content, ctaPrimaryText })} />
        <EditorField label="Primary Link" value={content.ctaPrimaryLink} onChange={(ctaPrimaryLink) => onChange({ ...content, ctaPrimaryLink })} placeholder="/collections or https://example.com" />
        <EditorField label="Secondary Text" value={content.ctaSecondaryText} onChange={(ctaSecondaryText) => onChange({ ...content, ctaSecondaryText })} />
        <EditorField label="Secondary Link" value={content.ctaSecondaryLink} onChange={(ctaSecondaryLink) => onChange({ ...content, ctaSecondaryLink })} placeholder="/about or https://wa.me/... (empty = site WhatsApp)" />
      </div>
    </div>
  );
}
