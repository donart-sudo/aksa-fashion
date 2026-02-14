"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CheckoutPage() {
  const t = useTranslations("common");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-8">
        {t("checkout")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Form */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h2 className="font-serif text-xl text-charcoal mb-4">
              Contact Information
            </h2>
            <Input
              id="checkoutEmail"
              label="Email"
              type="email"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <h2 className="font-serif text-xl text-charcoal mb-4">
              Shipping Address
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input id="firstName" label="First Name" placeholder="First name" />
                <Input id="lastName" label="Last Name" placeholder="Last name" />
              </div>
              <Input id="address" label="Address" placeholder="Street address" />
              <div className="grid grid-cols-2 gap-4">
                <Input id="city" label="City" placeholder="City" />
                <Input id="zip" label="Postal Code" placeholder="10000" />
              </div>
              <Input id="country" label="Country" placeholder="Kosovo" />
              <Input id="phone" label="Phone" type="tel" placeholder="+383..." />
            </div>
          </div>

          <Button variant="primary" size="lg" className="w-full">
            Continue to Payment
          </Button>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-warm-white p-6 sticky top-32">
            <h2 className="font-serif text-xl text-charcoal mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm border-b border-soft-gray/50 pb-4 mb-4">
              <div className="flex justify-between text-charcoal/60">
                <span>{t("subtotal")}</span>
                <span>€0.00</span>
              </div>
              <div className="flex justify-between text-charcoal/60">
                <span>{t("shipping")}</span>
                <span>{t("free")}</span>
              </div>
            </div>
            <div className="flex justify-between font-medium text-charcoal">
              <span>{t("total")}</span>
              <span>€0.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
