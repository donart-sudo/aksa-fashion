"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CONTACT_INFO, SOCIAL_LINKS } from "@/lib/constants";

export default function ContactPage() {
  const t = useTranslations("common");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-4">
          {t("contact")}
        </h1>
        <p className="text-charcoal/60 max-w-md mx-auto">
          We&apos;d love to hear from you. Reach out for appointments, inquiries,
          or just to say hello.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Contact form */}
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="firstName" label="First Name" placeholder="Your name" />
            <Input id="lastName" label="Last Name" placeholder="Last name" />
          </div>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="your@email.com"
          />
          <Input id="phone" label="Phone" type="tel" placeholder="+383..." />
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-charcoal/70 mb-1.5"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Tell us about your dream dress..."
              className="w-full px-4 py-3 bg-white border border-soft-gray text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
            />
          </div>
          <Button variant="primary" className="w-full">
            Send Message
          </Button>
        </form>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <h3 className="font-serif text-xl text-charcoal mb-3">
              Visit Our Atelier
            </h3>
            <p className="text-charcoal/60">{CONTACT_INFO.address}</p>
            <p className="text-charcoal/60">{CONTACT_INFO.hours}</p>
          </div>
          <div>
            <h3 className="font-serif text-xl text-charcoal mb-3">
              Get in Touch
            </h3>
            <p className="text-charcoal/60">{CONTACT_INFO.phone}</p>
            <p className="text-charcoal/60">{CONTACT_INFO.email}</p>
          </div>
          <div>
            <h3 className="font-serif text-xl text-charcoal mb-3">WhatsApp</h3>
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-dark transition-colors"
            >
              Chat with us on WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
