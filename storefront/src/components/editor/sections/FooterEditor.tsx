"use client";

import type { FooterContent, FooterLink } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";

interface Props {
  content: FooterContent;
  onChange: (c: FooterContent) => void;
}

export default function FooterEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-6">
      <EditorField
        label="About Text"
        value={content.aboutText}
        onChange={(aboutText) => onChange({ ...content, aboutText })}
        type="textarea"
        rows={2}
      />

      <ArrayField<FooterLink>
        label="Shop Links"
        items={content.shopLinks}
        onChange={(shopLinks) => onChange({ ...content, shopLinks })}
        addLabel="Add shop link"
        createItem={() => ({ label: "", href: "/" })}
        renderItem={(link, _i, update) => (
          <div className="grid grid-cols-2 gap-2">
            <EditorField label="Label" value={link.label} onChange={(label) => update({ ...link, label })} />
            <EditorField label="URL" value={link.href} onChange={(href) => update({ ...link, href })} />
          </div>
        )}
      />

      <ArrayField<FooterLink>
        label="Help Links"
        items={content.helpLinks}
        onChange={(helpLinks) => onChange({ ...content, helpLinks })}
        addLabel="Add help link"
        createItem={() => ({ label: "", href: "/" })}
        renderItem={(link, _i, update) => (
          <div className="grid grid-cols-2 gap-2">
            <EditorField label="Label" value={link.label} onChange={(label) => update({ ...link, label })} />
            <EditorField label="URL" value={link.href} onChange={(href) => update({ ...link, href })} />
          </div>
        )}
      />
    </div>
  );
}
