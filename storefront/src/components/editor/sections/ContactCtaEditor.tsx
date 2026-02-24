"use client";

import type { ContactCtaContent } from "@/types/content-blocks";
import EditorField from "../EditorField";

interface Props {
  content: ContactCtaContent;
  onChange: (c: ContactCtaContent) => void;
}

export default function ContactCtaEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* WhatsApp CTA */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">WhatsApp CTA</p>
        <EditorField label="Badge Text" value={content.whatsappBadge} onChange={(whatsappBadge) => onChange({ ...content, whatsappBadge })} placeholder="e.g. Preferred by 90% of our clients" />
        <EditorField label="Heading" value={content.whatsappHeading} onChange={(whatsappHeading) => onChange({ ...content, whatsappHeading })} />
        <EditorField label="Heading Accent" value={content.whatsappHeadingAccent} onChange={(whatsappHeadingAccent) => onChange({ ...content, whatsappHeadingAccent })} />
        <EditorField label="Description" value={content.whatsappDescription} onChange={(whatsappDescription) => onChange({ ...content, whatsappDescription })} type="textarea" rows={3} />
        <EditorField label="Button Text" value={content.whatsappButtonText} onChange={(whatsappButtonText) => onChange({ ...content, whatsappButtonText })} />
      </div>

      {/* Explore CTA */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Explore CTA</p>
        <EditorField label="Label" value={content.exploreLabel} onChange={(exploreLabel) => onChange({ ...content, exploreLabel })} />
        <EditorField label="Heading" value={content.exploreHeading} onChange={(exploreHeading) => onChange({ ...content, exploreHeading })} />
        <EditorField label="Heading Accent" value={content.exploreHeadingAccent} onChange={(exploreHeadingAccent) => onChange({ ...content, exploreHeadingAccent })} />
        <EditorField label="Description" value={content.exploreDescription} onChange={(exploreDescription) => onChange({ ...content, exploreDescription })} type="textarea" rows={2} />
        <EditorField label="Primary Button" value={content.explorePrimaryText} onChange={(explorePrimaryText) => onChange({ ...content, explorePrimaryText })} />
        <EditorField label="Primary Link" value={content.explorePrimaryLink} onChange={(explorePrimaryLink) => onChange({ ...content, explorePrimaryLink })} placeholder="/collections or https://example.com" />
        <EditorField label="Secondary Button" value={content.exploreSecondaryText} onChange={(exploreSecondaryText) => onChange({ ...content, exploreSecondaryText })} />
        <EditorField label="Secondary Link" value={content.exploreSecondaryLink} onChange={(exploreSecondaryLink) => onChange({ ...content, exploreSecondaryLink })} placeholder="/about or https://example.com" />
      </div>
    </div>
  );
}
