"use client";

import type { EditorialBandContent } from "@/types/content-blocks";
import ImageUploader from "../ImageUploader";
import EditorField from "../EditorField";

interface Props {
  content: EditorialBandContent;
  onChange: (c: EditorialBandContent) => void;
}

export default function EditorialBandEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <ImageUploader
        label="Editorial Band Image"
        value={content.image}
        onChange={(image) => onChange({ ...content, image })}
      />
      <EditorField
        label="Alt Text"
        value={content.alt}
        onChange={(alt) => onChange({ ...content, alt })}
      />
    </div>
  );
}
