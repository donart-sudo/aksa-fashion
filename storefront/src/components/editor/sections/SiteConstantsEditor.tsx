"use client";

import type { SiteConstantsContent } from "@/types/content-blocks";
import EditorField from "../EditorField";
import FieldGroup from "../FieldGroup";
import LinkField from "../LinkField";

interface Props {
  content: SiteConstantsContent;
  onChange: (c: SiteConstantsContent) => void;
}

export default function SiteConstantsEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <EditorField label="Site Name" value={content.siteName} onChange={(siteName) => onChange({ ...content, siteName })} />
      <EditorField label="Site Description" value={content.siteDescription} onChange={(siteDescription) => onChange({ ...content, siteDescription })} type="textarea" rows={2} />
      <FieldGroup label="Contact Info" variant="divider">
        <EditorField label="Email" value={content.email} onChange={(email) => onChange({ ...content, email })} />
        <EditorField label="Phone" value={content.phone} onChange={(phone) => onChange({ ...content, phone })} />
        <EditorField label="Address" value={content.address} onChange={(address) => onChange({ ...content, address })} />
        <EditorField label="Hours" value={content.hours} onChange={(hours) => onChange({ ...content, hours })} />
      </FieldGroup>
      <FieldGroup label="Social Links" variant="divider">
        <LinkField label="Instagram" value={content.instagram} onChange={(instagram) => onChange({ ...content, instagram })} placeholder="https://instagram.com/..." />
        <LinkField label="Facebook" value={content.facebook} onChange={(facebook) => onChange({ ...content, facebook })} placeholder="https://facebook.com/..." />
        <LinkField label="TikTok" value={content.tiktok} onChange={(tiktok) => onChange({ ...content, tiktok })} placeholder="https://tiktok.com/@..." />
        <LinkField label="WhatsApp" value={content.whatsapp} onChange={(whatsapp) => onChange({ ...content, whatsapp })} placeholder="https://wa.me/383..." />
      </FieldGroup>
    </div>
  );
}
