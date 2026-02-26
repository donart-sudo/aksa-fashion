"use client";

import type { ContactSidebarContent } from "@/types/content-blocks";
import EditorField from "../EditorField";
import FieldGroup from "../FieldGroup";

interface Props {
  content: ContactSidebarContent;
  onChange: (c: ContactSidebarContent) => void;
}

export default function ContactSidebarEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <FieldGroup label="Atelier Header">
        <EditorField label="Label" value={content.atelierLabel} onChange={(atelierLabel) => onChange({ ...content, atelierLabel })} />
        <EditorField label="Heading" value={content.atelierHeading} onChange={(atelierHeading) => onChange({ ...content, atelierHeading })} />
        <EditorField label="Heading Accent" value={content.atelierHeadingAccent} onChange={(atelierHeadingAccent) => onChange({ ...content, atelierHeadingAccent })} />
      </FieldGroup>

      <FieldGroup label="Info Text">
        <EditorField label="Closed Day Text" value={content.closedDayText} onChange={(closedDayText) => onChange({ ...content, closedDayText })} placeholder="e.g. Sunday: Closed" />
        <EditorField label="Appointment Line 1" value={content.appointmentLine1} onChange={(appointmentLine1) => onChange({ ...content, appointmentLine1 })} />
        <EditorField label="Appointment Line 2" value={content.appointmentLine2} onChange={(appointmentLine2) => onChange({ ...content, appointmentLine2 })} />
        <EditorField label="Follow Us Label" value={content.followUsLabel} onChange={(followUsLabel) => onChange({ ...content, followUsLabel })} />
      </FieldGroup>

      {/* Quote */}
      <EditorField
        label="Brand Quote"
        value={content.brandQuote}
        onChange={(brandQuote) => onChange({ ...content, brandQuote })}
        type="textarea"
        rows={2}
      />

      <p className="text-[10px] text-charcoal/35 leading-relaxed">
        Address, phone, hours, and social links are managed via Site Constants editor.
      </p>
    </div>
  );
}
