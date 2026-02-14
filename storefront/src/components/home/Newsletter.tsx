"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Newsletter() {
  const t = useTranslations("home");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="relative bg-charcoal overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:min-h-[420px]">
        {/* Image panel */}
        <div className="relative h-52 sm:h-60 lg:h-auto lg:flex-[40] overflow-hidden">
          <Image
            src="https://ariart.shop/wp-content/uploads/2026/01/Solar-Elegance-scaled.jpg"
            alt="Aksa Fashion"
            fill
            className="object-cover object-[50%_30%]"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-charcoal/20" />
          <div className="absolute bottom-4 left-5 lg:bottom-8 lg:left-8">
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-medium">
              {t("estLine")}
            </span>
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 lg:flex-[60] flex items-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24 lg:py-16">
          <div className="w-full max-w-md">
            <span className="block h-[2px] w-8 bg-gold mb-6" />

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white leading-tight mb-3">
              {t("newsletterTitle")}
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-8 max-w-sm">
              {t("newsletterSubtitle")}
            </p>

            {submitted ? (
              <div className="border border-gold/40 px-6 py-5">
                <p className="text-gold font-serif text-xl">
                  {t("newsletterSuccess")}
                </p>
                <p className="text-sm text-white/50 mt-1">
                  {t("newsletterSuccessDetail")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder={t("newsletterPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-transparent border-b border-white/30 px-0 py-3 text-sm text-white placeholder:text-white/35 focus:border-gold focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-7 py-3 text-xs font-medium tracking-widest uppercase bg-gold text-white hover:bg-gold-dark transition-colors duration-300 min-h-[44px]"
                  >
                    {t("newsletterButton")}
                  </button>
                </div>
                <p className="text-[11px] text-white/30">
                  {t("newsletterDisclaimer")}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
