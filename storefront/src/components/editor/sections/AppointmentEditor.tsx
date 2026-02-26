"use client";

import type { AppointmentContent } from "@/types/content-blocks";
import ImageUploader from "../ImageUploader";
import EditorField from "../EditorField";
import FieldGroup from "../FieldGroup";
import LinkField from "../LinkField";

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
      <LinkField
        label="WhatsApp URL"
        value={content.whatsappUrl}
        onChange={(whatsappUrl) => onChange({ ...content, whatsappUrl })}
        placeholder="https://wa.me/383..."
      />

      <FieldGroup label="Section Text">
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
      </FieldGroup>
    </div>
  );
}
