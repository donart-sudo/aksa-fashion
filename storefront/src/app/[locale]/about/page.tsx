import { getContentBlocks } from "@/lib/data/content-blocks";
import EditableSection from "@/components/editor/EditableSection";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import AboutCraftSection from "@/components/about/AboutCraftSection";
import AboutCtaSection from "@/components/about/AboutCtaSection";
import type {
  AboutHeroContent,
  AboutCraftContent,
  AboutCtaContent,
} from "@/types/content-blocks";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const contentMap = await getContentBlocks(
    ["page.about.hero", "page.about.craft", "page.about.cta"],
    locale
  );

  return (
    <div>
      <EditableSection sectionKey="page.about.hero" label="About Hero">
        <AboutHeroSection content={contentMap["page.about.hero"] as AboutHeroContent | undefined} />
      </EditableSection>

      <EditableSection sectionKey="page.about.craft" label="Craft & Values">
        <AboutCraftSection content={contentMap["page.about.craft"] as AboutCraftContent | undefined} />
      </EditableSection>

      <EditableSection sectionKey="page.about.cta" label="Atelier & CTA">
        <AboutCtaSection content={contentMap["page.about.cta"] as AboutCtaContent | undefined} />
      </EditableSection>
    </div>
  );
}
