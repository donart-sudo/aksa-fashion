"use client";

import type { ContactFormContent } from "@/types/content-blocks";
import EditorField from "../EditorField";
import ArrayField from "../ArrayField";

interface Props {
  content: ContactFormContent;
  onChange: (c: ContactFormContent) => void;
}

export default function ContactFormEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Form Header */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Form Header</p>
        <EditorField label="Label" value={content.formLabel} onChange={(formLabel) => onChange({ ...content, formLabel })} placeholder="e.g. Send a Message" />
        <EditorField label="Heading" value={content.formHeading} onChange={(formHeading) => onChange({ ...content, formHeading })} />
        <EditorField label="Heading Accent" value={content.formHeadingAccent} onChange={(formHeadingAccent) => onChange({ ...content, formHeadingAccent })} />
        <EditorField label="Subtitle" value={content.formSubtitle} onChange={(formSubtitle) => onChange({ ...content, formSubtitle })} type="textarea" rows={2} />
      </div>

      {/* Inquiry Types */}
      <ArrayField<string>
        label="Inquiry Types"
        items={content.inquiryTypes ?? []}
        onChange={(inquiryTypes) => onChange({ ...content, inquiryTypes })}
        addLabel="Add Type"
        maxItems={10}
        createItem={() => ""}
        renderItem={(type, _i, update) => (
          <EditorField label={`Type ${_i + 1}`} value={type} onChange={update} placeholder="e.g. Bridal Consultation" />
        )}
      />

      {/* Submit & Success */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Submit & Success</p>
        <EditorField label="Submit Button Text" value={content.submitButtonText} onChange={(submitButtonText) => onChange({ ...content, submitButtonText })} />
        <EditorField label="Success Heading" value={content.successHeading} onChange={(successHeading) => onChange({ ...content, successHeading })} />
        <EditorField label="Success Message" value={content.successMessage} onChange={(successMessage) => onChange({ ...content, successMessage })} />
      </div>
    </div>
  );
}
