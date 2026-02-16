"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

const faqKeys = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
  visible,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  visible: boolean;
}) {
  return (
    <div
      className="border-b border-charcoal/10"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(15px)",
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 60}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 60}ms`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-[16px] text-charcoal pr-8 group-hover:text-charcoal/80 transition-colors">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-gold text-lg font-light transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <p className="text-[15px] text-charcoal/60 leading-relaxed pb-5">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const t = useTranslations("home");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-5 lg:gap-16">
          {/* Left — heading (sticky on desktop) */}
          <div className="lg:col-span-2 mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-32">
              {/* Gold line + label */}
              <div
                className="flex items-center gap-4 mb-6"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateX(-20px)",
                  transition:
                    "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <span className="block h-[1.5px] w-10 bg-gold" />
                <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
                  {t("faqLabel")}
                </span>
              </div>

              {/* Heading */}
              <h2
                className="font-serif text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] font-bold text-charcoal leading-[0.95] mb-4"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(25px)",
                  transition:
                    "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 120ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 120ms",
                }}
              >
                {t("faqTitle")}
              </h2>

              {/* Subtitle */}
              <p
                className="text-[15px] text-charcoal/50 leading-relaxed max-w-sm"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(15px)",
                  transition:
                    "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 220ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) 220ms",
                }}
              >
                {t("faqSubtitle")}
              </p>
            </div>
          </div>

          {/* Right — accordion */}
          <div className="lg:col-span-3">
            <div className="border-t border-charcoal/10">
              {faqKeys.map((num, i) => (
                <AccordionItem
                  key={num}
                  question={t(`faq${num}Q`)}
                  answer={t(`faq${num}A`)}
                  isOpen={openIndex === i}
                  onToggle={() =>
                    setOpenIndex(openIndex === i ? null : i)
                  }
                  index={i}
                  visible={visible}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
