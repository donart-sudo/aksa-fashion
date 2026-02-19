"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { getOrders, type CustomerOrder } from "@/lib/data/supabase-customer";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
  };

  const classes = colorMap[status] || colorMap.pending;

  return (
    <span className={`inline-flex px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${classes}`}>
      {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}

export default function OrdersPage() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { customer, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!customer) return;

    async function fetchOrders() {
      const data = await getOrders(20, 0);
      setOrders(data.orders);
      setCount(data.count);
      setLoading(false);
    }
    fetchOrders();
  }, [customer]);

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

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back link */}
        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium transition-colors mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          {t("dashboard")}
        </Link>

        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal mb-8">{t("myOrders")}</h1>

        {orders.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-soft-gray/30 flex items-center justify-center mx-auto mb-6">
              <ShoppingBagIcon className="w-8 h-8 text-charcoal/25" />
            </div>
            <h2 className="font-serif text-xl text-charcoal mb-2">{t("noOrders")}</h2>
            <p className="text-charcoal/50 text-sm mb-8">{t("noOrdersDesc")}</p>
            <Link
              href={`/${locale}/collections`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors"
            >
              {t("startShopping")}
            </Link>
          </motion.div>
        ) : (
          /* Order list */
          <div className="space-y-4">
            {orders.map((order, i) => {
              const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/${locale}/account/orders/${order.id}`}>
                    <div className="bg-white border border-soft-gray/40 rounded-xl p-5 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-charcoal font-mono">
                            AF-{order.display_id}
                          </p>
                          <p className="text-xs text-charcoal/40 mt-0.5">{orderDate}</p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-charcoal/60">
                          {itemCount} {itemCount === 1 ? tc("item") : tc("items")}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-charcoal">
                            {formatPrice(order.total)}
                          </span>
                          <ChevronRightIcon className="w-4 h-4 text-charcoal/20 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
