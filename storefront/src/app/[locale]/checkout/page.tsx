"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const t = useTranslations("common");
  const tCo = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tAccount = useTranslations("account");
  const locale = useLocale();
  const { items, subtotal, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 text-center">
        <h1 className="font-serif text-3xl text-charcoal mb-4">{t("checkout")}</h1>
        <p className="text-charcoal/60 mb-6">{tCart("empty")}</p>
        <Link href={`/${locale}/collections`}>
          <Button variant="primary">{t("continueShopping")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-8">
        {t("checkout")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Form */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h2 className="font-serif text-xl text-charcoal mb-4">
              {tCo("contactInfo")}
            </h2>
            <Input
              id="checkoutEmail"
              label={tAccount("email")}
              type="email"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <h2 className="font-serif text-xl text-charcoal mb-4">
              {tCo("shippingAddress")}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input id="firstName" label={tAccount("firstName")} placeholder={tAccount("firstName")} />
                <Input id="lastName" label={tAccount("lastName")} placeholder={tAccount("lastName")} />
              </div>
              <Input id="address" label={tCo("address")} placeholder={tCo("address")} />
              <div className="grid grid-cols-2 gap-4">
                <Input id="city" label={tCo("city")} placeholder={tCo("city")} />
                <Input id="zip" label={tCo("postalCode")} placeholder="10000" />
              </div>
              <Input id="country" label={tCo("country")} placeholder="Kosovo" />
              <Input id="phone" label={tCo("phone")} type="tel" placeholder="+383..." />
            </div>
          </div>

          <Button variant="primary" size="lg" className="w-full">
            {tCo("continueToPayment")}
          </Button>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-warm-white p-6 sticky top-24">
            <h2 className="font-serif text-xl text-charcoal mb-4">
              {tCart("orderSummary")}
            </h2>

            {/* Cart items preview */}
            <ul className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-18 bg-soft-gray/30 flex-shrink-0">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-charcoal text-white text-[10px] flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-charcoal line-clamp-1">{item.title}</p>
                    {(item.size || item.color) && (
                      <p className="text-[10px] text-charcoal/40">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-charcoal flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-3 text-sm border-t border-soft-gray/50 pt-4 mb-4">
              <div className="flex justify-between text-charcoal/60">
                <span>{t("subtotal")}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal/60">
                <span>{t("shipping")}</span>
                <span>{t("free")}</span>
              </div>
            </div>
            <div className="flex justify-between font-medium text-charcoal">
              <span>{t("total")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
