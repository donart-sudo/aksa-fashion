"use client";

import type { FeaturedCollectionsContent, FeaturedCollectionItem } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";
import ImageUploader from "../ImageUploader";

interface Props {
  content: FeaturedCollectionsContent;
  onChange: (c: FeaturedCollectionsContent) => void;
}

export default function FeaturedCollectionsEditor({ content, onChange }: Props) {
  return (
    <ArrayField<FeaturedCollectionItem>
      label="Collections"
      items={content.collections}
      onChange={(collections) => onChange({ ...content, collections })}
      addLabel="Add collection"
      maxItems={8}
      createItem={() => ({ key: "", image: "", href: "/collections/" })}
      renderItem={(item, _i, update) => (
        <div className="space-y-2">
          <EditorField label="Key" value={item.key} onChange={(key) => update({ ...item, key })} placeholder="bridal" />
          <ImageUploader label="Cover Image" value={item.image} onChange={(image) => update({ ...item, image })} />
          <EditorField label="Link" value={item.href} onChange={(href) => update({ ...item, href })} placeholder="/collections/bridal" />
        </div>
      )}
    />
  );
}
