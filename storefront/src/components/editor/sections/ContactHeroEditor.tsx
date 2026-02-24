"use client";

import type { ContactHeroContent } from "@/types/content-blocks";
import ImageUploader from "../ImageUploader";
import EditorField from "../EditorField";

interface Props {
  content: ContactHeroContent;
  onChange: (c: ContactHeroContent) => void;
}

export default function ContactHeroEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <ImageUploader
        label="Hero Image"
        value={content.heroImage}
        onChange={(heroImage) => onChange({ ...content, heroImage })}
      />
      <EditorField label="Hero Alt" value={content.heroAlt} onChange={(heroAlt) => onChange({ ...content, heroAlt })} />
      <EditorField label="Tagline" value={content.tagline} onChange={(tagline) => onChange({ ...content, tagline })} placeholder="e.g. Get in Touch" />
      <EditorField label="Heading" value={content.heading} onChange={(heading) => onChange({ ...content, heading })} />
      <EditorField label="Heading Accent" value={content.headingAccent} onChange={(headingAccent) => onChange({ ...content, headingAccent })} />
      <EditorField label="Intro Paragraph" value={content.introParagraph} onChange={(introParagraph) => onChange({ ...content, introParagraph })} type="textarea" rows={3} />
    </div>
  );
}
