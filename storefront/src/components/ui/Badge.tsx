import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "new" | "sale" | "bestseller" | "default";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase",
        {
          "bg-gold text-white": variant === "new",
          "bg-red-500 text-white": variant === "sale",
          "bg-charcoal text-warm-white": variant === "bestseller",
          "bg-soft-gray text-charcoal": variant === "default",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
