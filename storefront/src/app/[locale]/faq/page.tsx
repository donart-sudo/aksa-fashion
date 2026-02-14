"use client";

import { useTranslations } from "next-intl";

const faqs = [
  {
    q: "How do I book a fitting appointment?",
    a: "You can book an appointment through our contact page, by calling us, or via WhatsApp. We recommend booking at least one week in advance for weekend appointments.",
  },
  {
    q: "Do you offer custom-made dresses?",
    a: "Yes! We offer bespoke bridal and evening wear services. Our skilled seamstresses can create a custom gown based on your vision, measurements, and preferences.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 14 days of purchase for unworn items in original condition with tags attached. Custom-made dresses are final sale.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship throughout Europe and select international destinations. Shipping times and costs vary by location. Free shipping on orders over €150 within Kosovo.",
  },
  {
    q: "How long does it take to receive my order?",
    a: "Standard orders are processed within 2-3 business days. Delivery takes 3-5 days within Kosovo, 7-14 days for international orders. Custom orders take 4-8 weeks.",
  },
  {
    q: "Do you offer alterations?",
    a: "Yes, we provide professional alteration services for all dresses purchased from Aksa Fashion. Minor alterations are complimentary for bridal gowns.",
  },
];

export default function FAQPage() {
  const t = useTranslations("home");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-4 text-center">
        {t("faqTitle")}
      </h1>
      <p className="text-charcoal/60 text-center mb-12">
        Everything you need to know about shopping with us
      </p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group border border-soft-gray/50 bg-white"
          >
            <summary className="flex items-center justify-between cursor-pointer p-5 text-charcoal font-medium">
              {faq.q}
              <span className="text-gold ml-4 text-xl group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-charcoal/60 leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
