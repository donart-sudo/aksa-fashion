"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { SOCIAL_LINKS } from "@/lib/constants";
import { getOrder, type MedusaOrder } from "@/lib/data/supabase-checkout";
import {
  CheckCircleIcon,
  TruckIcon,
  EnvelopeIcon,
  GiftIcon,
  ArrowRightIcon,
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

/* ─── WhatsApp icon ─── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.609l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.68-6.354-1.845l-.244-.156-3.662 1.228 1.228-3.662-.156-.244A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

export default function OrderConfirmationPage() {
  const t = useTranslations("order");
  const tc = useTranslations("common");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<MedusaOrder | null>(null);
  const [loading, setLoading] = useState(!!orderId);

  // Fetch real order data if order_id present
  useEffect(() => {
    if (!orderId) return;

    async function fetchOrder() {
      const data = await getOrder(orderId!);
      setOrder(data);
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  // Fallback order number
  const fallbackOrderNumber = (() => {
    try {
      const displayId = localStorage.getItem("aksa_last_order_display_id");
      if (displayId) return `AF-${displayId}`;
    } catch { /* ignore */ }
    return `AF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  })();

  const orderNumber = order
    ? `AF-${order.display_id}`
    : fallbackOrderNumber;

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full"
        />
      </div>
    );
  }

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

          {/* Order items (if from Medusa) */}
          {order?.items && order.items.length > 0 && (
            <div className="mt-6 pt-6 border-t border-soft-gray/30">
              <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-4">
                {t("orderDetails")}
              </p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.thumbnail && (
                      <div className="relative w-14 h-18 bg-soft-gray/20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal font-medium line-clamp-1">{item.title}</p>
                      {item.variant?.title && item.variant.title !== "Default" && (
                        <p className="text-xs text-charcoal/40 mt-0.5">{item.variant.title}</p>
                      )}
                      <p className="text-xs text-charcoal/40 mt-0.5">
                        {tc("quantity")}: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-charcoal flex-shrink-0">
                      {formatPrice(item.total)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-soft-gray/20 space-y-2 text-sm">
                <div className="flex justify-between text-charcoal/50">
                  <span>{tc("subtotal")}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal/50">
                  <span>{tc("shipping")}</span>
                  <span>{order.shipping_total === 0 ? tc("free") : formatPrice(order.shipping_total)}</span>
                </div>
                <div className="flex justify-between font-semibold text-charcoal pt-2 border-t border-soft-gray/20">
                  <span>{tc("total")}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Shipping address */}
          {order?.shipping_address && (
            <div className="mt-6 pt-6 border-t border-soft-gray/30">
              <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-2">
                {t("shippingTo")}
              </p>
              <p className="text-sm text-charcoal">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </p>
              <p className="text-sm text-charcoal/60">
                {order.shipping_address.address_1}
                {order.shipping_address.address_2 && `, ${order.shipping_address.address_2}`}
              </p>
              <p className="text-sm text-charcoal/60">
                {order.shipping_address.city} {order.shipping_address.postal_code}, {order.shipping_address.country_code?.toUpperCase()}
              </p>
            </div>
          )}

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

        {/* WhatsApp payment card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
              <WhatsAppIcon className="w-6 h-6 text-[#25D366]" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg text-charcoal mb-1">
                {t("paymentArrangement")}
              </h3>
              <p className="text-sm text-charcoal/50 leading-relaxed mb-4">
                {t("paymentArrangementDesc")}
              </p>
              <a
                href={`${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(`Hi, I just placed order #${orderNumber}. I'd like to arrange payment.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#22c55e] transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                {t("chatToArrangePayment")}
              </a>
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
            href={`/${locale}/account/orders`}
            className="flex items-center justify-center gap-2 w-full py-3.5 border border-soft-gray/40 text-charcoal text-sm font-medium rounded-xl hover:border-gold/40 hover:bg-gold/5 transition-colors"
          >
            {t("viewAllOrders")}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
