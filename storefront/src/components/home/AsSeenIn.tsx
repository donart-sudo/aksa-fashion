"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const PRESS_MARKS = [
  "Vogue Sposa",
  "Brides Magazine",
  "Kosovo Fashion Week",
  "Elle Bridal",
  "Harper's Bazaar",
];

export default function AsSeenIn() {
  const t = useTranslations("home");
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-cream border-t border-soft-gray/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <p
          className="text-center text-[11px] tracking-[0.35em] uppercase text-charcoal/35 mb-10 sm:mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(10px)",
            transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {t("asSeenIn")}
        </p>

        {/* Press logos as styled text */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 lg:gap-x-16 gap-y-6">
          {PRESS_MARKS.map((name, i) => (
            <span
              key={name}
              className="font-serif text-lg sm:text-xl lg:text-2xl text-charcoal/20 hover:text-charcoal/50 transition-colors duration-500 select-none whitespace-nowrap"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(12px)",
                transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 80}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 80}ms`,
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
