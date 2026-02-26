"use client";

import type { ContactCtaContent } from "@/types/content-blocks";
import EditorField from "../EditorField";
import FieldGroup from "../FieldGroup";
import LinkField from "../LinkField";

interface Props {
  content: ContactCtaContent;
  onChange: (c: ContactCtaContent) => void;
}

export default function ContactCtaEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <FieldGroup label="WhatsApp CTA">
        <EditorField label="Badge Text" value={content.whatsappBadge} onChange={(whatsappBadge) => onChange({ ...content, whatsappBadge })} placeholder="e.g. Preferred by 90% of our clients" />
        <EditorField label="Heading" value={content.whatsappHeading} onChange={(whatsappHeading) => onChange({ ...content, whatsappHeading })} />
        <EditorField label="Heading Accent" value={content.whatsappHeadingAccent} onChange={(whatsappHeadingAccent) => onChange({ ...content, whatsappHeadingAccent })} />
        <EditorField label="Description" value={content.whatsappDescription} onChange={(whatsappDescription) => onChange({ ...content, whatsappDescription })} type="textarea" rows={3} />
        <EditorField label="Button Text" value={content.whatsappButtonText} onChange={(whatsappButtonText) => onChange({ ...content, whatsappButtonText })} />
      </FieldGroup>

      <FieldGroup label="Explore CTA">
        <EditorField label="Label" value={content.exploreLabel} onChange={(exploreLabel) => onChange({ ...content, exploreLabel })} />
        <EditorField label="Heading" value={content.exploreHeading} onChange={(exploreHeading) => onChange({ ...content, exploreHeading })} />
        <EditorField label="Heading Accent" value={content.exploreHeadingAccent} onChange={(exploreHeadingAccent) => onChange({ ...content, exploreHeadingAccent })} />
        <EditorField label="Description" value={content.exploreDescription} onChange={(exploreDescription) => onChange({ ...content, exploreDescription })} type="textarea" rows={2} />
        <EditorField label="Primary Button" value={content.explorePrimaryText} onChange={(explorePrimaryText) => onChange({ ...content, explorePrimaryText })} />
        <LinkField label="Primary Link" value={content.explorePrimaryLink} onChange={(explorePrimaryLink) => onChange({ ...content, explorePrimaryLink })} placeholder="/collections or https://example.com" />
        <EditorField label="Secondary Button" value={content.exploreSecondaryText} onChange={(exploreSecondaryText) => onChange({ ...content, exploreSecondaryText })} />
        <LinkField label="Secondary Link" value={content.exploreSecondaryLink} onChange={(exploreSecondaryLink) => onChange({ ...content, exploreSecondaryLink })} placeholder="/about or https://example.com" />
      </FieldGroup>
    </div>
  );
}
