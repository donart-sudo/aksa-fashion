"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useStorefrontAdmin } from "@/lib/storefront-admin";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const { token } = useStorefrontAdmin();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const json = await res.json();
      if (json.url) {
        onChange(json.url);
      }
    } catch {
      // Upload failed silently
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {label && (
        <label className="block text-[11px] font-medium text-charcoal/60 tracking-wide uppercase mb-1.5">
          {label}
        </label>
      )}

      <div className="flex items-start gap-3">
        {/* Preview */}
        {value && (
          <div className="relative w-20 h-20 rounded overflow-hidden border border-soft-gray/50 flex-shrink-0">
            <Image src={value} alt="" fill className="object-cover" sizes="80px" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* URL input */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL"
            className="w-full px-3 py-2 text-[13px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50 transition-colors"
          />

          {/* Upload button */}
          <label className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gold border border-gold/30 rounded cursor-pointer hover:bg-gold/5 transition-colors">
            {uploading ? (
              <div className="w-3 h-3 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
            Upload
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
