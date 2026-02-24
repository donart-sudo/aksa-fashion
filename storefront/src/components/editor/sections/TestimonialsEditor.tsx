"use client";

import type { TestimonialsContent, TestimonialStory } from "@/types/content-blocks";
import ArrayField from "../ArrayField";
import EditorField from "../EditorField";
import ImageUploader from "../ImageUploader";

interface Props {
  content: TestimonialsContent;
  onChange: (c: TestimonialsContent) => void;
}

export default function TestimonialsEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Section Text */}
      <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
        <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">Section Text</p>
        <EditorField
          label="Section Heading"
          value={content.heading || ""}
          onChange={(heading) => onChange({ ...content, heading })}
          placeholder="e.g. Real Brides, Real Stories"
        />
        <EditorField
          label="Subtitle"
          value={content.subtitle || ""}
          onChange={(subtitle) => onChange({ ...content, subtitle })}
          placeholder="e.g. Bride Stories"
        />
      </div>

    <ArrayField<TestimonialStory>
      label="Testimonials"
      items={content.stories ?? []}
      onChange={(stories) => onChange({ ...content, stories })}
      addLabel="Add testimonial"
      maxItems={10}
      createItem={() => ({
        id: String(Date.now()),
        name: "",
        location: "",
        text: "",
        rating: 5,
        image: "",
        product: { name: "", handle: "", price: 0, category: "" },
      })}
      renderItem={(story, _i, update) => (
        <div className="space-y-2">
          <EditorField label="Name" value={story.name} onChange={(name) => update({ ...story, name })} />
          <EditorField label="Location" value={story.location} onChange={(location) => update({ ...story, location })} />
          <EditorField label="Quote" value={story.text} onChange={(text) => update({ ...story, text })} type="textarea" rows={2} />
          <div>
            <label className="block text-[11px] font-medium text-charcoal/60 tracking-wide uppercase mb-1.5">Rating</label>
            <input
              type="number"
              min={1}
              max={5}
              value={story.rating}
              onChange={(e) => update({ ...story, rating: Number(e.target.value) })}
              className="w-20 px-3 py-2 text-[13px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50"
            />
          </div>
          <ImageUploader label="Image" value={story.image} onChange={(image) => update({ ...story, image })} />
          <div className="border-t border-soft-gray/30 pt-2 mt-2">
            <p className="text-[10px] font-medium text-charcoal/40 uppercase tracking-wide mb-2">Linked Product</p>
            <div className="grid grid-cols-2 gap-2">
              <EditorField label="Product Name" value={story.product.name} onChange={(name) => update({ ...story, product: { ...story.product, name } })} />
              <EditorField label="Handle" value={story.product.handle} onChange={(handle) => update({ ...story, product: { ...story.product, handle } })} />
              <EditorField label="Price (EUR)" value={String(story.product.price)} onChange={(p) => update({ ...story, product: { ...story.product, price: Number(p) || 0 } })} type="number" />
              <EditorField label="Category" value={story.product.category} onChange={(category) => update({ ...story, product: { ...story.product, category } })} />
            </div>
          </div>
        </div>
      )}
    />
    </div>
  );
}
