"use client";

interface EditorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "url" | "number" | "textarea";
  placeholder?: string;
  rows?: number;
  hint?: string;
}

export default function EditorField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  rows = 3,
  hint,
}: EditorFieldProps) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-charcoal/60 tracking-wide uppercase mb-1.5">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 text-[13px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50 transition-colors resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-[13px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50 transition-colors"
        />
      )}
      {hint && (
        <p className="mt-1 text-[10px] text-charcoal/40 leading-relaxed">{hint}</p>
      )}
    </div>
  );
}
