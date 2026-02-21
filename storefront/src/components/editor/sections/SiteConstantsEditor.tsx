"use client";

import type { SiteConstantsContent } from "@/types/content-blocks";
import EditorField from "../EditorField";

interface Props {
  content: SiteConstantsContent;
  onChange: (c: SiteConstantsContent) => void;
}

export default function SiteConstantsEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <EditorField label="Site Name" value={content.siteName} onChange={(siteName) => onChange({ ...content, siteName })} />
      <EditorField label="Site Description" value={content.siteDescription} onChange={(siteDescription) => onChange({ ...content, siteDescription })} type="textarea" rows={2} />
      <div className="border-t border-soft-gray/30 pt-4 mt-4">
        <p className="text-[10px] font-medium text-charcoal/40 uppercase tracking-wide mb-3">Contact Info</p>
        <div className="space-y-3">
          <EditorField label="Email" value={content.email} onChange={(email) => onChange({ ...content, email })} />
          <EditorField label="Phone" value={content.phone} onChange={(phone) => onChange({ ...content, phone })} />
          <EditorField label="Address" value={content.address} onChange={(address) => onChange({ ...content, address })} />
          <EditorField label="Hours" value={content.hours} onChange={(hours) => onChange({ ...content, hours })} />
        </div>
      </div>
      <div className="border-t border-soft-gray/30 pt-4 mt-4">
        <p className="text-[10px] font-medium text-charcoal/40 uppercase tracking-wide mb-3">Social Links</p>
        <div className="space-y-3">
          <EditorField label="Instagram" value={content.instagram} onChange={(instagram) => onChange({ ...content, instagram })} type="url" />
          <EditorField label="Facebook" value={content.facebook} onChange={(facebook) => onChange({ ...content, facebook })} type="url" />
          <EditorField label="TikTok" value={content.tiktok} onChange={(tiktok) => onChange({ ...content, tiktok })} type="url" />
          <EditorField label="WhatsApp" value={content.whatsapp} onChange={(whatsapp) => onChange({ ...content, whatsapp })} type="url" />
        </div>
      </div>
    </div>
  );
}
