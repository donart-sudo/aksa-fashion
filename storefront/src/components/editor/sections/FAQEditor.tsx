"use client";

import type { FAQContent, FAQItem } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";

interface Props {
  content: FAQContent;
  onChange: (c: FAQContent) => void;
}

export default function FAQEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <EditorField
        label="Subtitle"
        value={content.subtitle}
        onChange={(subtitle) => onChange({ ...content, subtitle })}
      />
      <ArrayField<FAQItem>
        label="FAQ Items"
        items={content.items}
        onChange={(items) => onChange({ ...content, items })}
        addLabel="Add FAQ"
        createItem={() => ({ q: "", a: "" })}
        renderItem={(faq, _i, update) => (
          <div className="space-y-2">
            <EditorField label="Question" value={faq.q} onChange={(q) => update({ ...faq, q })} />
            <EditorField label="Answer" value={faq.a} onChange={(a) => update({ ...faq, a })} type="textarea" rows={3} />
          </div>
        )}
      />
    </div>
  );
}
