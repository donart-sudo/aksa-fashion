"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  TruckIcon,
  EnvelopeIcon,
  GiftIcon,
  ArrowRightIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

/* ─── Animated confetti dot ─── */
function ConfettiDot({ delay, x, y, color }: { delay: number; x: number; y: number; color: string }) {
  return (
    <motion.div
      className={`absolute w-2 h-2 rounded-full ${color}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0.5],
        y: [0, -40, -80],
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

/* ─── Timeline step ─── */
function TimelineStep({
  icon: Icon,
  text,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.15 }}
      className="flex items-start gap-4"
    >
      <div className="relative flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gold" />
        </div>
        {index < 2 && (
          <div className="w-px h-8 bg-gold/15 mt-1" />
        )}
      </div>
      <div className="pt-2">
        <p className="text-sm text-charcoal leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}

export default function OrderConfirmationPage() {
  const t = useTranslations("order");
  const tc = useTranslations("common");
  const locale = useLocale();

  // Generate a fake order number for demo
  const orderNumber = `AF-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  // Estimated delivery date (5-7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 7);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const confettiColors = [
    "bg-gold/60",
    "bg-rose/50",
    "bg-amber-400/50",
    "bg-gold/40",
    "bg-rose/30",
    "bg-amber-300/40",
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Success animation */}
        <div className="relative flex flex-col items-center mb-10">
          {/* Confetti */}
          {confettiColors.map((color, i) => (
            <ConfettiDot
              key={i}
              delay={0.2 + i * 0.1}
              x={35 + Math.sin(i * 1.5) * 25}
              y={20 + Math.cos(i * 1.2) * 15}
              color={color}
            />
          ))}

          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
            >
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-serif text-3xl lg:text-4xl text-charcoal text-center mb-2"
          >
            {t("thankYou")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-charcoal/50 text-center text-sm"
          >
            {t("confirmed")}
          </motion.p>
        </div>

        {/* Order details card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-soft-gray/30 rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Order number */}
            <div>
              <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-1">
                {t("orderNumber")}
              </p>
              <p className="text-charcoal font-semibold font-mono text-lg">{orderNumber}</p>
            </div>

            {/* Estimated delivery */}
            <div>
              <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-1">
                {t("estimatedDelivery")}
              </p>
              <p className="text-charcoal font-medium">
                {formatDate(deliveryDate)} – {formatDate(deliveryEnd)}
              </p>
            </div>
          </div>

          {/* Status bar */}
          <div className="mt-6 pt-6 border-t border-soft-gray/30">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-1.5 bg-soft-gray/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "15%" }}
                    transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gold rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] font-medium text-gold">{t("processing")}</span>
                  <span className="text-[11px] text-charcoal/25">{t("shipped")}</span>
                  <span className="text-[11px] text-charcoal/25">{t("delivered")}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What's next timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white border border-soft-gray/30 rounded-2xl p-6 sm:p-8 mb-6"
        >
          <h2 className="font-serif text-xl text-charcoal mb-6">{t("whatsNext")}</h2>
          <div className="space-y-1">
            <TimelineStep icon={GiftIcon} text={t("step1")} index={0} />
            <TimelineStep icon={EnvelopeIcon} text={t("step2")} index={1} />
            <TimelineStep icon={TruckIcon} text={t("step3")} index={2} />
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <Link
            href={`/${locale}/collections`}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-charcoal/90 transition-colors"
          >
            {t("continueMessage")}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>

          <Link
            href={`/${locale}/account`}
            className="flex items-center justify-center gap-2 w-full py-3.5 border border-soft-gray/40 text-charcoal text-sm font-medium rounded-xl hover:border-gold/40 hover:bg-gold/5 transition-colors"
          >
            {t("viewAllOrders")}
          </Link>
        </motion.div>

        {/* Help card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-charcoal/40 mb-2">{t("needHelp")}</p>
          <a
            href="https://wa.me/38349123456"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/80 font-medium transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
            {t("contactSupport")}
          </a>
        </motion.div>
      </div>
    </div>
  );
}
