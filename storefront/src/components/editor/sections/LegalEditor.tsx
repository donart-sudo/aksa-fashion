"use client";

import type { LegalContent, LegalSection } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";

interface Props {
  content: LegalContent;
  onChange: (c: LegalContent) => void;
}

export default function LegalEditor({ content, onChange }: Props) {
  return (
    <ArrayField<LegalSection>
      label="Sections"
      items={content.sections}
      onChange={(sections) => onChange({ ...content, sections })}
      addLabel="Add section"
      createItem={() => ({ title: "", body: "" })}
      renderItem={(section, _i, update) => (
        <div className="space-y-2">
          <EditorField label="Title" value={section.title} onChange={(title) => update({ ...section, title })} />
          <EditorField label="Body" value={section.body} onChange={(body) => update({ ...section, body })} type="textarea" rows={6} />
        </div>
      )}
    />
  );
}
