"use client";

import type { AppointmentContent } from "@/types/content-blocks";
import ImageUploader from "../ImageUploader";
import EditorField from "../EditorField";

interface Props {
  content: AppointmentContent;
  onChange: (c: AppointmentContent) => void;
}

export default function AppointmentEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <ImageUploader
        label="Appointment Image"
        value={content.image}
        onChange={(image) => onChange({ ...content, image })}
      />
      <EditorField
        label="Location"
        value={content.location}
        onChange={(location) => onChange({ ...content, location })}
      />
      <EditorField
        label="WhatsApp URL"
        value={content.whatsappUrl}
        onChange={(whatsappUrl) => onChange({ ...content, whatsappUrl })}
        type="url"
      />

      {/* Section Text */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Section Text</p>
        <EditorField
          label="Heading"
          value={content.heading || ""}
          onChange={(heading) => onChange({ ...content, heading })}
          placeholder="e.g. Book Your Private Appointment"
        />
        <EditorField
          label="Subtitle"
          value={content.subtitle || ""}
          onChange={(subtitle) => onChange({ ...content, subtitle })}
          placeholder="e.g. Visit our atelier..."
          type="textarea"
          rows={2}
        />
        <EditorField
          label="Button Text"
          value={content.buttonText || ""}
          onChange={(buttonText) => onChange({ ...content, buttonText })}
          placeholder="e.g. Book Appointment"
        />
      </div>
    </div>
  );
}
