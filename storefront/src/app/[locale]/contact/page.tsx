"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useSiteConstants } from "@/lib/site-constants";
import { cdnUrl } from "@/lib/cdn-image-urls";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* contactMethods and socials are built inside the component using useSiteConstants */

const inquiryTypes = [
  "Bridal Consultation",
  "Evening Wear Inquiry",
  "Custom Design",
  "Order Status",
  "Collaboration",
  "Other",
];

export default function ContactPage() {
  const locale = useLocale();
  const sc = useSiteConstants();
  const SOCIAL_LINKS = { instagram: sc.instagram, facebook: sc.facebook, tiktok: sc.tiktok, whatsapp: sc.whatsapp };
  const CONTACT_INFO = { email: sc.email, phone: sc.phone, address: sc.address, hours: sc.hours };
  const [selectedInquiry, setSelectedInquiry] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const contactMethods = [
    {
      icon: (
        <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      label: "WhatsApp",
      value: CONTACT_INFO.phone,
      description: "Fastest response — most brides prefer this",
      href: SOCIAL_LINKS.whatsapp,
      external: true,
    },
    {
      icon: (
        <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      label: "Email",
      value: CONTACT_INFO.email,
      description: "For detailed inquiries and custom orders",
      href: `mailto:${CONTACT_INFO.email}`,
      external: false,
    },
    {
      icon: (
        <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      label: "Phone",
      value: CONTACT_INFO.phone,
      description: "Available during business hours",
      href: `tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`,
      external: false,
    },
    {
      icon: (
        <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      label: "Visit Us",
      value: "Prishtina",
      description: CONTACT_INFO.address,
      href: "https://maps.google.com/?q=Prishtina+Kosovo",
      external: true,
    },
  ];

  const socials = [
    {
      name: "Instagram",
      href: SOCIAL_LINKS.instagram,
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: SOCIAL_LINKS.facebook,
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: SOCIAL_LINKS.tiktok,
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative h-[38vh] min-h-[260px] sm:h-[42vh] sm:min-h-[300px] md:h-[48vh] md:min-h-[340px] lg:h-[55vh] lg:min-h-[400px] xl:h-[60vh] xl:min-h-[440px] overflow-hidden">
        <Image
          src={cdnUrl("abella-e552-browne-01.jpg")}
          alt="Aksa Fashion — Contact us"
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-charcoal/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-6 sm:pb-10 md:pb-14 lg:pb-18 xl:pb-20">
            <motion.div initial="hidden" animate="visible">
              <motion.p
                custom={0}
                variants={fadeUp}
                className="text-gold text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs tracking-[0.35em] sm:tracking-[0.4em] md:tracking-[0.5em] uppercase mb-1.5 sm:mb-2 md:mb-3"
              >
                Get in Touch
              </motion.p>
              <motion.h1
                custom={1}
                variants={fadeUp}
                className="font-serif text-[1.5rem] sm:text-[1.75rem] md:text-4xl lg:text-5xl xl:text-6xl text-white leading-[1.15] sm:leading-[1.1] mb-1.5 sm:mb-2 md:mb-4"
              >
                Let&apos;s Create Something
                <br />
                <span className="italic text-gold/90">Beautiful Together</span>
              </motion.h1>
              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-white/50 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] leading-relaxed max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg"
              >
                Whether you have a vision or need guidance, our team is here to
                help you find the perfect gown.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Contact Methods ── */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-24 xl:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.label}
                href={method.href}
                target={method.external ? "_blank" : undefined}
                rel={method.external ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="group relative bg-white border border-charcoal/[0.06] p-4 sm:p-5 md:p-6 hover:border-gold/30 hover:shadow-lg transition-all duration-500 cursor-pointer min-h-[140px] sm:min-h-[160px]"
              >
                {/* Icon */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center bg-cream text-gold/60 group-hover:bg-gold group-hover:text-white transition-all duration-500 mb-3 sm:mb-4 md:mb-5">
                  {method.icon}
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-charcoal/30 mb-0.5 sm:mb-1">
                  {method.label}
                </p>
                <p className="font-serif text-base sm:text-lg md:text-xl text-charcoal mb-1.5 sm:mb-2 group-hover:text-gold transition-colors duration-300 break-words">
                  {method.value}
                </p>
                <p className="text-[10px] sm:text-[11px] md:text-[12px] text-charcoal/40 leading-relaxed">
                  {method.description}
                </p>
                {/* Hover arrow */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 text-charcoal/10 group-hover:text-gold/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + Info Split ── */}
      <section className="bg-[#f5f0eb]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Form */}
            <div className="px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-10 sm:py-14 md:py-20 lg:py-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                  <span className="h-px w-6 sm:w-8 md:w-10 bg-gold/40" />
                  <span className="text-gold/60 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.35em] sm:tracking-[0.4em] uppercase">
                    Send a Message
                  </span>
                </div>
                <h2 className="font-serif text-[1.4rem] sm:text-[1.65rem] md:text-3xl lg:text-4xl xl:text-[2.65rem] text-charcoal leading-tight mb-2 sm:mb-3 md:mb-4">
                  Tell Us About Your <span className="italic text-gold">Vision</span>
                </h2>
                <p className="text-charcoal/45 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] leading-relaxed mb-6 sm:mb-8 md:mb-10 max-w-md">
                  Share your ideas and we&apos;ll get back to you within 24 hours
                  with a personalized response.
                </p>

                {formSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 sm:p-8 md:p-10 text-center"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gold/10 flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-charcoal mb-1.5 sm:mb-2">
                      Message Sent
                    </h3>
                    <p className="text-charcoal/45 text-[12px] sm:text-[13px] md:text-[14px]">
                      Thank you! We&apos;ll be in touch within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                      <div>
                        <label htmlFor="firstName" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          required
                          placeholder="Your name"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          required
                          placeholder="Last name"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">
                        Phone <span className="normal-case text-charcoal/25">(optional)</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+383 ..."
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200"
                      />
                    </div>

                    {/* Inquiry type */}
                    <div>
                      <label className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1.5 sm:mb-2 md:mb-3">
                        Inquiry Type
                      </label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {inquiryTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setSelectedInquiry(type)}
                            className={`px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[11px] md:text-[12px] tracking-wide transition-all duration-300 min-h-[36px] sm:min-h-[40px] ${
                              selectedInquiry === type
                                ? "bg-charcoal text-white"
                                : "bg-white border border-charcoal/[0.08] text-charcoal/50 hover:border-charcoal/20 hover:text-charcoal"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        required
                        placeholder="Tell us about your dream dress, the occasion, your vision..."
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200 resize-none sm:min-h-[140px] md:min-h-[160px]"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 bg-charcoal text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 min-h-[44px] sm:min-h-[48px]"
                    >
                      Send Message
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </form>
                )}
              </motion.div>
            </div>

            {/* Right: Dark info panel */}
            <div className="bg-charcoal px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-10 sm:py-14 md:py-20 lg:py-24 flex flex-col justify-between">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                  <span className="h-px w-6 sm:w-8 md:w-10 bg-gold/40" />
                  <span className="text-gold/60 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.35em] sm:tracking-[0.4em] uppercase">
                    The Atelier
                  </span>
                </div>
                <h2 className="font-serif text-[1.4rem] sm:text-[1.65rem] md:text-3xl lg:text-4xl xl:text-[2.65rem] text-white leading-tight mb-6 sm:mb-8 md:mb-10">
                  Visit Us in
                  <br />
                  <span className="italic text-gold">Prishtina</span>
                </h2>

                {/* Info items */}
                <div className="space-y-5 sm:space-y-6 md:space-y-8 mb-8 sm:mb-10 md:mb-14">
                  <div>
                    <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/25 mb-1 sm:mb-1.5">
                      Address
                    </p>
                    <p className="text-white/60 text-[13px] sm:text-[14px] md:text-[15px]">{CONTACT_INFO.address}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/25 mb-1 sm:mb-1.5">
                      Working Hours
                    </p>
                    <p className="text-white/60 text-[13px] sm:text-[14px] md:text-[15px]">{CONTACT_INFO.hours}</p>
                    <p className="text-white/30 text-[11px] sm:text-[12px] md:text-[13px] mt-0.5">Sunday: Closed</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/25 mb-1 sm:mb-1.5">
                      Appointments
                    </p>
                    <p className="text-white/60 text-[13px] sm:text-[14px] md:text-[15px]">
                      Private fittings available by appointment.
                    </p>
                    <p className="text-white/60 text-[13px] sm:text-[14px] md:text-[15px]">
                      Walk-ins welcome during business hours.
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06] mb-6 sm:mb-8 md:mb-10" />

                {/* Socials */}
                <div>
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/25 mb-3 sm:mb-4">
                    Follow Us
                  </p>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {socials.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-white/[0.08] text-white/30 hover:text-white hover:border-gold/40 hover:bg-gold/10 transition-all duration-300"
                        aria-label={social.name}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Bottom quote */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 md:pt-10 border-t border-white/[0.06]"
              >
                <blockquote className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl text-white/20 italic leading-relaxed">
                  &ldquo;The dress should wear the occasion, and you should wear the dress.&rdquo;
                </blockquote>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA Banner ── */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-24 xl:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden bg-charcoal p-5 sm:p-8 md:p-12 lg:p-16 xl:p-20"
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/[0.04] to-transparent" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 md:gap-8">
              <div className="max-w-lg">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-green-500/10 text-green-400">
                    <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-white/30">
                    Preferred by 90% of our clients
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white leading-tight mb-2 sm:mb-3 md:mb-4">
                  Prefer WhatsApp? <span className="italic text-gold/80">So do we.</span>
                </h3>
                <p className="text-white/40 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] leading-relaxed">
                  Most of our brides start their journey with a simple WhatsApp message.
                  Share your inspiration photos, get instant advice, and book your
                  fitting — all from your phone.
                </p>
              </div>

              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 bg-green-500 hover:bg-green-400 text-white text-[10px] sm:text-[11px] md:text-[12px] font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase transition-all duration-300 flex-shrink-0 min-h-[44px] sm:min-h-[48px]"
              >
                <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Start a Chat
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Explore CTA ── */}
      <section className="pb-10 sm:pb-14 md:pb-20 lg:pb-24 xl:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
              <span className="h-px w-6 sm:w-8 md:w-10 bg-gold/40" />
              <span className="text-gold/60 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.35em] sm:tracking-[0.4em] uppercase">
                While You&apos;re Here
              </span>
              <span className="h-px w-6 sm:w-8 md:w-10 bg-gold/40" />
            </div>
            <h2 className="font-serif text-[1.4rem] sm:text-[1.65rem] md:text-3xl lg:text-4xl xl:text-[2.65rem] text-charcoal mb-2 sm:mb-3 md:mb-4">
              Explore Our <span className="italic text-gold">Collections</span>
            </h2>
            <p className="text-charcoal/45 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] max-w-[280px] sm:max-w-sm md:max-w-md mx-auto leading-relaxed mb-6 sm:mb-8 md:mb-10">
              Browse our latest gowns for inspiration before your consultation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 md:gap-4">
              <Link
                href={`/${locale}/collections`}
                className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-charcoal text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 sm:min-w-[200px] min-h-[44px] sm:min-h-[48px]"
              >
                View Collections
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href={`/${locale}/about`}
                className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 border border-charcoal/15 text-charcoal text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-all duration-500 sm:min-w-[200px] min-h-[44px] sm:min-h-[48px]"
              >
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
