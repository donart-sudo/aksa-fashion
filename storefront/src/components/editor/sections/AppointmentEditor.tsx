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
    </div>
  );
}
