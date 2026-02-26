"use client";

import type { AboutCraftContent, CraftStep, AboutValue } from "@/types/content-blocks";
import EditorField from "../EditorField";
import ArrayField from "../ArrayField";
import FieldGroup from "../FieldGroup";

interface Props {
  content: AboutCraftContent;
  onChange: (c: AboutCraftContent) => void;
}

export default function AboutCraftEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <FieldGroup label="Craftsmanship">
        <EditorField label="Label" value={content.craftLabel} onChange={(craftLabel) => onChange({ ...content, craftLabel })} placeholder="e.g. The Craft" />
        <EditorField label="Heading" value={content.craftHeading} onChange={(craftHeading) => onChange({ ...content, craftHeading })} />
        <EditorField label="Heading Accent" value={content.craftHeadingAccent} onChange={(craftHeadingAccent) => onChange({ ...content, craftHeadingAccent })} />
        <EditorField label="Description" value={content.craftDescription} onChange={(craftDescription) => onChange({ ...content, craftDescription })} type="textarea" rows={2} />
      </FieldGroup>

      {/* Craft Steps */}
      <ArrayField<CraftStep>
        label="Process Steps"
        items={content.craftSteps ?? []}
        onChange={(craftSteps) => onChange({ ...content, craftSteps })}
        addLabel="Add Step"
        maxItems={6}
        createItem={() => ({ num: "", title: "", desc: "" })}
        renderItem={(step, _i, update) => (
          <div className="space-y-2">
            <EditorField label="Number" value={step.num} onChange={(num) => update({ ...step, num })} placeholder="e.g. 01" />
            <EditorField label="Title" value={step.title} onChange={(title) => update({ ...step, title })} placeholder="e.g. Select" />
            <EditorField label="Description" value={step.desc} onChange={(desc) => update({ ...step, desc })} type="textarea" rows={2} />
          </div>
        )}
      />

      <FieldGroup label="Values">
        <EditorField label="Label" value={content.valuesLabel} onChange={(valuesLabel) => onChange({ ...content, valuesLabel })} placeholder="e.g. What We Stand For" />
        <EditorField label="Heading" value={content.valuesHeading} onChange={(valuesHeading) => onChange({ ...content, valuesHeading })} />
      </FieldGroup>

      <ArrayField<AboutValue>
        label="Values"
        items={content.values ?? []}
        onChange={(values) => onChange({ ...content, values })}
        addLabel="Add Value"
        maxItems={6}
        createItem={() => ({ number: "", title: "", description: "", iconKey: "sparkles" })}
        renderItem={(val, _i, update) => (
          <div className="space-y-2">
            <EditorField label="Number" value={val.number} onChange={(number) => update({ ...val, number })} placeholder="e.g. 01" />
            <EditorField label="Title" value={val.title} onChange={(title) => update({ ...val, title })} />
            <EditorField label="Description" value={val.description} onChange={(description) => update({ ...val, description })} type="textarea" rows={2} />
            <div>
              <label className="block text-[11px] font-medium text-charcoal/60 tracking-wide uppercase mb-1.5">Icon</label>
              <select
                value={val.iconKey}
                onChange={(e) => update({ ...val, iconKey: e.target.value })}
                className="w-full px-3 py-2 text-[13px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50 transition-colors"
              >
                <option value="sparkles">Sparkles</option>
                <option value="person">Person</option>
                <option value="heart">Heart</option>
                <option value="chat">Chat</option>
                <option value="globe">Globe</option>
                <option value="measure">Measure</option>
              </select>
            </div>
          </div>
        )}
      />
    </div>
  );
}
