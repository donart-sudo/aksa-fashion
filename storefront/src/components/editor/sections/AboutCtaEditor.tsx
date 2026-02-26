"use client";

import type { AboutCtaContent } from "@/types/content-blocks";
import ImageUploader from "../ImageUploader";
import EditorField from "../EditorField";
import ArrayField from "../ArrayField";
import FieldGroup from "../FieldGroup";
import LinkField from "../LinkField";

interface Props {
  content: AboutCtaContent;
  onChange: (c: AboutCtaContent) => void;
}

export default function AboutCtaEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <FieldGroup label="Atelier">
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
      </FieldGroup>

      <FieldGroup label="Promise">
        <EditorField label="Label" value={content.promiseLabel} onChange={(promiseLabel) => onChange({ ...content, promiseLabel })} />
        <EditorField label="Heading" value={content.promiseHeading} onChange={(promiseHeading) => onChange({ ...content, promiseHeading })} />
        <EditorField label="Heading Accent" value={content.promiseHeadingAccent} onChange={(promiseHeadingAccent) => onChange({ ...content, promiseHeadingAccent })} />
        <EditorField label="Paragraph" value={content.promiseParagraph} onChange={(promiseParagraph) => onChange({ ...content, promiseParagraph })} type="textarea" rows={3} />
      </FieldGroup>

      <FieldGroup label="CTA Buttons">
        <EditorField label="Primary Text" value={content.ctaPrimaryText} onChange={(ctaPrimaryText) => onChange({ ...content, ctaPrimaryText })} />
        <LinkField label="Primary Link" value={content.ctaPrimaryLink} onChange={(ctaPrimaryLink) => onChange({ ...content, ctaPrimaryLink })} placeholder="/collections or https://example.com" />
        <EditorField label="Secondary Text" value={content.ctaSecondaryText} onChange={(ctaSecondaryText) => onChange({ ...content, ctaSecondaryText })} />
        <LinkField label="Secondary Link" value={content.ctaSecondaryLink} onChange={(ctaSecondaryLink) => onChange({ ...content, ctaSecondaryLink })} placeholder="/about or https://wa.me/..." />
      </FieldGroup>
    </div>
  );
}
