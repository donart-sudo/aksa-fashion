import { getContentBlocks } from "@/lib/data/content-blocks";
import EditableSection from "@/components/editor/EditableSection";
import ContactHeroSection from "@/components/contact/ContactHeroSection";
import ContactFormSection from "@/components/contact/ContactFormSection";
import ContactCtaSection from "@/components/contact/ContactCtaSection";
import type {
  ContactHeroContent,
  ContactFormContent,
  ContactSidebarContent,
  ContactCtaContent,
} from "@/types/content-blocks";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const contentMap = await getContentBlocks(
    [
      "page.contact.hero",
      "page.contact.form",
      "page.contact.sidebar",
      "page.contact.cta",
    ],
    locale
  );

  return (
    <div>
      <EditableSection sectionKey="page.contact.hero" label="Contact Hero">
        <ContactHeroSection content={contentMap["page.contact.hero"] as ContactHeroContent | undefined} />
      </EditableSection>

      {/* Form + Sidebar are rendered together but editable separately */}
      <EditableSection sectionKey="page.contact.form" label="Contact Form">
        <ContactFormSection
          content={{
            form: contentMap["page.contact.form"] as ContactFormContent,
            sidebar: contentMap["page.contact.sidebar"] as ContactSidebarContent,
          }}
        />
      </EditableSection>

      <EditableSection sectionKey="page.contact.cta" label="Contact CTAs">
        <ContactCtaSection content={contentMap["page.contact.cta"] as ContactCtaContent | undefined} />
      </EditableSection>
    </div>
  );
}
