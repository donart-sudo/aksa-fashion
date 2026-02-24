"use client";

import type { AboutHeroContent, AboutStat } from "@/types/content-blocks";
import ImageUploader from "../ImageUploader";
import EditorField from "../EditorField";
import ArrayField from "../ArrayField";

interface Props {
  content: AboutHeroContent;
  onChange: (c: AboutHeroContent) => void;
}

export default function AboutHeroEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Hero</p>
        <ImageUploader
          label="Hero Image"
          value={content.heroImage}
          onChange={(heroImage) => onChange({ ...content, heroImage })}
        />
        <EditorField label="Hero Alt" value={content.heroAlt} onChange={(heroAlt) => onChange({ ...content, heroAlt })} />
        <EditorField label="Tagline" value={content.tagline} onChange={(tagline) => onChange({ ...content, tagline })} placeholder="e.g. Our Story" />
        <EditorField label="Heading" value={content.heading} onChange={(heading) => onChange({ ...content, heading })} placeholder="e.g. Born in Prishtina," />
        <EditorField label="Heading Accent" value={content.headingAccent} onChange={(headingAccent) => onChange({ ...content, headingAccent })} placeholder="e.g. Worn Around the World" />
        <EditorField label="Intro Paragraph" value={content.introParagraph} onChange={(introParagraph) => onChange({ ...content, introParagraph })} type="textarea" rows={3} />
      </div>

      {/* Brand Story */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Brand Story</p>
        <EditorField label="Label" value={content.brandLabel} onChange={(brandLabel) => onChange({ ...content, brandLabel })} placeholder="e.g. The Beginning" />
        <EditorField label="Heading" value={content.brandHeading} onChange={(brandHeading) => onChange({ ...content, brandHeading })} />
        <EditorField label="Heading Accent" value={content.brandHeadingAccent} onChange={(brandHeadingAccent) => onChange({ ...content, brandHeadingAccent })} />
        <ArrayField<string>
          label="Paragraphs"
          items={content.brandParagraphs ?? []}
          onChange={(brandParagraphs) => onChange({ ...content, brandParagraphs })}
          addLabel="Add Paragraph"
          createItem={() => ""}
          renderItem={(text, _i, update) => (
            <EditorField label={`Paragraph ${_i + 1}`} value={text} onChange={update} type="textarea" rows={3} />
          )}
        />
        <ImageUploader
          label="Brand Image"
          value={content.brandImage}
          onChange={(brandImage) => onChange({ ...content, brandImage })}
        />
        <EditorField label="Brand Image Alt" value={content.brandImageAlt} onChange={(brandImageAlt) => onChange({ ...content, brandImageAlt })} />
      </div>

      {/* Year Badge */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Year Badge</p>
        <EditorField label="Year" value={content.yearBadge} onChange={(yearBadge) => onChange({ ...content, yearBadge })} />
        <EditorField label="Label" value={content.yearBadgeLabel} onChange={(yearBadgeLabel) => onChange({ ...content, yearBadgeLabel })} />
      </div>

      {/* Stats */}
      <ArrayField<AboutStat>
        label="Statistics"
        items={content.stats ?? []}
        onChange={(stats) => onChange({ ...content, stats })}
        addLabel="Add Stat"
        maxItems={6}
        createItem={() => ({ number: "", label: "" })}
        renderItem={(stat, _i, update) => (
          <div className="space-y-2">
            <EditorField label="Number" value={stat.number} onChange={(number) => update({ ...stat, number })} placeholder="e.g. 2,000+" />
            <EditorField label="Label" value={stat.label} onChange={(label) => update({ ...stat, label })} placeholder="e.g. Gowns Crafted" />
          </div>
        )}
      />
    </div>
  );
}
