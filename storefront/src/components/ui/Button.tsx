import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-300 min-h-[44px]",
          {
            "bg-gold text-white hover:bg-gold-dark active:scale-[0.98]":
              variant === "primary",
            "bg-charcoal text-warm-white hover:bg-charcoal/90 active:scale-[0.98]":
              variant === "secondary",
            "border-2 border-gold text-gold hover:bg-gold hover:text-white active:scale-[0.98]":
              variant === "outline",
            "text-charcoal hover:text-gold": variant === "ghost",
          },
          {
            "px-4 py-2 text-xs": size === "sm",
            "px-6 py-3 text-sm": size === "md",
            "px-8 py-4 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
