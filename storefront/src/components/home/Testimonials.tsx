"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { MOCK_TESTIMONIALS } from "@/lib/constants";

export default function Testimonials() {
  const t = useTranslations("home");
  const [current, setCurrent] = useState(0);

  const next = () =>
    setCurrent((prev) => (prev + 1) % MOCK_TESTIMONIALS.length);
  const prev = () =>
    setCurrent(
      (prev) =>
        (prev - 1 + MOCK_TESTIMONIALS.length) % MOCK_TESTIMONIALS.length
    );

  const testimonial = MOCK_TESTIMONIALS[current];

  return (
    <section className="py-20 lg:py-28 bg-charcoal text-warm-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-2">
            {t("testimonialsTitle")}
          </h2>
          <p className="text-warm-white/50 mb-12">
            {t("testimonialsSubtitle")}
          </p>
        </motion.div>

        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-gold" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-serif text-xl sm:text-2xl leading-relaxed text-warm-white/90 mb-8 italic">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div>
                <p className="font-medium text-gold">{testimonial.name}</p>
                <p className="text-sm text-warm-white/40">
                  {testimonial.location}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-2 border border-warm-white/20 hover:border-gold hover:text-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Previous testimonial"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="p-2 border border-warm-white/20 hover:border-gold hover:text-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Next testimonial"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {MOCK_TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? "bg-gold" : "bg-warm-white/20"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
