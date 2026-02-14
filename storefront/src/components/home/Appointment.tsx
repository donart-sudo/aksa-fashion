"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Appointment() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <section className="py-20 lg:py-28 bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-charcoal text-warm-white p-8 sm:p-12 lg:p-16 text-center"
        >
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">
            Prishtina, Kosovo
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-4">
            {t("appointmentTitle")}
          </h2>
          <p className="text-warm-white/60 max-w-md mx-auto mb-8">
            {t("appointmentSubtitle")}
          </p>
          <Link href={`/${locale}/contact`}>
            <Button variant="primary" size="lg">
              {t("appointmentCta")}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
