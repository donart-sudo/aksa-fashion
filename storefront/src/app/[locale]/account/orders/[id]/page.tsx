"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { getOrder, type CustomerOrder } from "@/lib/data/supabase-customer";
import { formatPrice } from "@/lib/utils";
import { SOCIAL_LINKS } from "@/lib/constants";
import {
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    requires_action: "bg-amber-50 text-amber-700 border-amber-200",
    not_paid: "bg-amber-50 text-amber-700 border-amber-200",
    captured: "bg-green-50 text-green-700 border-green-200",
  };

  const classes = colorMap[status] || colorMap.pending;
  const label = status === "not_paid" ? "Awaiting Payment" : status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${classes}`}>
      {label}
    </span>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.609l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.68-6.354-1.845l-.244-.156-3.662 1.228 1.228-3.662-.156-.244A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

export default function OrderDetailPage() {
  const t = useTranslations("account");
  const tOrder = useTranslations("order");
  const tc = useTranslations("common");
  const locale = useLocale();
  const params = useParams();
  const orderId = params.id as string;
  const { customer, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer || !orderId) return;

    async function fetchOrder() {
      const data = await getOrder(orderId);
      setOrder(data);
      setLoading(false);
    }
    fetchOrder();
  }, [customer, orderId]);

  if (authLoading || loading) {
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

  if (!customer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-charcoal/50 mb-4">{t("signInRequired")}</p>
        <Link
          href={`/${locale}/account`}
          className="px-6 py-3 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors"
        >
          {t("signIn")}
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-charcoal/50 mb-4">{t("orderNotFound")}</p>
        <Link
          href={`/${locale}/account/orders`}
          className="px-6 py-3 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors"
        >
          {t("myOrders")}
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back link */}
        <Link
          href={`/${locale}/account/orders`}
          className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium transition-colors mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          {t("myOrders")}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="font-serif text-2xl text-charcoal">
              {t("orderNumber")} AF-{order.display_id}
            </h1>
            <p className="text-sm text-charcoal/50 mt-1">{orderDate}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-soft-gray/30 rounded-xl p-6 mb-6"
        >
          <h2 className="text-sm font-semibold text-charcoal mb-4">{tOrder("orderDetails")}</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {item.thumbnail && (
                  <div className="relative w-16 h-20 bg-soft-gray/20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal">{item.title}</p>
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
          <div className="mt-6 pt-4 border-t border-soft-gray/30 space-y-2 text-sm">
            <div className="flex justify-between text-charcoal/50">
              <span>{tc("subtotal")}</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal/50">
              <span>{tc("shipping")}</span>
              <span>
                {order.shipping_total === 0 ? tc("free") : formatPrice(order.shipping_total)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-charcoal pt-2 border-t border-soft-gray/20">
              <span>{tc("total")}</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </motion.div>

        {/* Shipping address */}
        {order.shipping_address && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-soft-gray/30 rounded-xl p-6 mb-6"
          >
            <h2 className="text-sm font-semibold text-charcoal mb-3">{tOrder("shippingTo")}</h2>
            <div className="text-sm text-charcoal/70 space-y-0.5">
              <p className="font-medium text-charcoal">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </p>
              <p>{order.shipping_address.address_1}</p>
              {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
              <p>
                {order.shipping_address.city} {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country_code?.toUpperCase()}</p>
              {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
            </div>
          </motion.div>
        )}

        {/* Payment status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-soft-gray/30 rounded-xl p-6 mb-6"
        >
          <h2 className="text-sm font-semibold text-charcoal mb-3">{tOrder("paymentMethod")}</h2>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.payment_status || "not_paid"} />
            {(!order.payment_status || order.payment_status === "not_paid") && (
              <span className="text-xs text-charcoal/40">{t("paymentPending")}</span>
            )}
          </div>
        </motion.div>

        {/* WhatsApp help */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
              <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-charcoal font-medium">{t("questionsAboutOrder")}</p>
            </div>
            <a
              href={`${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(`Hi, I have a question about order #AF-${order.display_id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] text-white text-xs font-medium rounded-lg hover:bg-[#22c55e] transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              {t("chatOnWhatsApp")}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
