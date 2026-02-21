"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface OrderItem {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Order {
  id: string;
  display_id: number;
  email: string;
  status: string;
  created_at: string;
  items: OrderItem[];
  shipping_address?: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    postal_code: string;
    country_code: string;
  };
  shipping_method?: string;
  subtotal: number;
  shipping_total: number;
  total: number;
  payment_status?: string;
  fulfillment_status?: string;
}

export default function OrderTrackingPage() {
  const t = useTranslations("orderTracking");
  const tc = useTranslations("common");

  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), orderNumber: orderNumber.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        setError(t("notFound"));
        return;
      }

      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError(t("notFound"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status: string, fulfillment?: string) => {
    if (fulfillment === "delivered" || status === "completed") return 100;
    if (fulfillment === "shipped") return 66;
    return 15;
  };

  const getStatusStep = (status: string, fulfillment?: string) => {
    if (fulfillment === "delivered" || status === "completed") return 3;
    if (fulfillment === "shipped") return 2;
    return 1;
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-2">
            {t("title")}
          </h1>
          <p className="text-charcoal/50 text-sm">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Search form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white border border-soft-gray/30 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-cream/50 border border-soft-gray/40 rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                {t("orderNumberLabel")}
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="AF-123"
                required
                className="w-full px-4 py-3 bg-cream/50 border border-soft-gray/40 rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-colors"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-red-500 text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <MagnifyingGlassIcon className="w-4 h-4" />
                {t("trackButton")}
              </>
            )}
          </button>
        </motion.form>

        {/* Order results */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Order header */}
            <div className="bg-white border border-soft-gray/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-1">
                    {t("order")}
                  </p>
                  <p className="text-charcoal font-semibold font-mono text-lg">
                    AF-{order.display_id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-1">
                    {tc("total")}
                  </p>
                  <p className="text-charcoal font-semibold text-lg">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              {/* Status bar */}
              <div>
                <div className="h-2 bg-soft-gray/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getStatusProgress(order.status, order.fulfillment_status ?? undefined)}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gold rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-3">
                  {[
                    { label: t("statusProcessing"), icon: ClockIcon, step: 1 },
                    { label: t("statusShipped"), icon: TruckIcon, step: 2 },
                    { label: t("statusDelivered"), icon: CheckCircleIcon, step: 3 },
                  ].map(({ label, icon: Icon, step }) => {
                    const currentStep = getStatusStep(order.status, order.fulfillment_status ?? undefined);
                    const isActive = step <= currentStep;
                    return (
                      <div key={step} className="flex flex-col items-center gap-1">
                        <Icon className={`w-5 h-5 ${isActive ? "text-gold" : "text-charcoal/20"}`} />
                        <span className={`text-[11px] font-medium ${isActive ? "text-gold" : "text-charcoal/25"}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Shipping info */}
              <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-soft-gray/30">
                <div>
                  <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-1">
                    {t("payment")}
                  </p>
                  <p className="text-sm text-charcoal capitalize">
                    {order.payment_status || "pending"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-1">
                    {t("shipping")}
                  </p>
                  <p className="text-sm text-charcoal">
                    {order.shipping_method || "Standard"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white border border-soft-gray/30 rounded-2xl p-6 sm:p-8">
                <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-4">
                  {t("items")}
                </p>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {item.thumbnail && (
                        <div className="relative w-14 h-[72px] bg-soft-gray/20 rounded-lg overflow-hidden flex-shrink-0">
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
                        {item.subtitle && (
                          <p className="text-xs text-charcoal/40 mt-0.5">{item.subtitle}</p>
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
            {order.shipping_address && (
              <div className="bg-white border border-soft-gray/30 rounded-2xl p-6 sm:p-8">
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
