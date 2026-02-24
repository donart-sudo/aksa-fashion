"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ContactFormContent, ContactSidebarContent } from "@/types/content-blocks";
import { DEFAULT_CONTACT_FORM, DEFAULT_CONTACT_SIDEBAR } from "@/lib/data/content-defaults";
import { useSiteConstants } from "@/lib/site-constants";

interface Props {
  content?: { form: ContactFormContent; sidebar: ContactSidebarContent };
}

export default function ContactFormSection({ content }: Props) {
  const form = { ...DEFAULT_CONTACT_FORM, ...content?.form };
  const sidebar = { ...DEFAULT_CONTACT_SIDEBAR, ...content?.sidebar };
  const sc = useSiteConstants();
  const [selectedInquiry, setSelectedInquiry] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const socials = [
    {
      name: "Instagram",
      href: sc.instagram,
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: sc.facebook,
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: sc.tiktok,
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
                <span className="text-gold/60 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.35em] sm:tracking-[0.4em] uppercase">{form.formLabel}</span>
              </div>
              <h2 className="font-serif text-[1.4rem] sm:text-[1.65rem] md:text-3xl lg:text-4xl xl:text-[2.65rem] text-charcoal leading-tight mb-2 sm:mb-3 md:mb-4">
                {form.formHeading} <span className="italic text-gold">{form.formHeadingAccent}</span>
              </h2>
              <p className="text-charcoal/45 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] leading-relaxed mb-6 sm:mb-8 md:mb-10 max-w-md">{form.formSubtitle}</p>

              {formSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 sm:p-8 md:p-10 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gold/10 flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-charcoal mb-1.5 sm:mb-2">{form.successHeading}</h3>
                  <p className="text-charcoal/45 text-[12px] sm:text-[13px] md:text-[14px]">{form.successMessage}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                    <div>
                      <label htmlFor="firstName" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">First Name</label>
                      <input id="firstName" type="text" required placeholder="Your name" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">Last Name</label>
                      <input id="lastName" type="text" required placeholder="Last name" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">Email</label>
                    <input id="email" type="email" required placeholder="your@email.com" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">Phone <span className="normal-case text-charcoal/25">(optional)</span></label>
                    <input id="phone" type="tel" placeholder="+383 ..." className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1.5 sm:mb-2 md:mb-3">Inquiry Type</label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {form.inquiryTypes.map((type) => (
                        <button key={type} type="button" onClick={() => setSelectedInquiry(type)} className={`px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[11px] md:text-[12px] tracking-wide transition-all duration-300 min-h-[36px] sm:min-h-[40px] ${selectedInquiry === type ? "bg-charcoal text-white" : "bg-white border border-charcoal/[0.08] text-charcoal/50 hover:border-charcoal/20 hover:text-charcoal"}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-[10px] sm:text-[11px] md:text-xs font-medium text-charcoal/50 tracking-wide uppercase mb-1 sm:mb-1.5 md:mb-2">Message</label>
                    <textarea id="message" rows={4} required placeholder="Tell us about your dream dress, the occasion, your vision..." className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 bg-white border border-charcoal/[0.08] text-[13px] sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors duration-200 resize-none sm:min-h-[140px] md:min-h-[160px]" />
                  </div>
                  <button type="submit" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 bg-charcoal text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 min-h-[44px] sm:min-h-[48px]">
                    {form.submitButtonText}
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                <span className="text-gold/60 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.35em] sm:tracking-[0.4em] uppercase">{sidebar.atelierLabel}</span>
              </div>
              <h2 className="font-serif text-[1.4rem] sm:text-[1.65rem] md:text-3xl lg:text-4xl xl:text-[2.65rem] text-white leading-tight mb-6 sm:mb-8 md:mb-10">
                {sidebar.atelierHeading}
                <br />
                <span className="italic text-gold">{sidebar.atelierHeadingAccent}</span>
              </h2>

              <div className="space-y-5 sm:space-y-6 md:space-y-8 mb-8 sm:mb-10 md:mb-14">
                <div>
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/25 mb-1 sm:mb-1.5">Address</p>
                  <p className="text-white/60 text-[13px] sm:text-[14px] md:text-[15px]">{sc.address}</p>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/25 mb-1 sm:mb-1.5">Working Hours</p>
                  <p className="text-white/60 text-[13px] sm:text-[14px] md:text-[15px]">{sc.hours}</p>
                  <p className="text-white/30 text-[11px] sm:text-[12px] md:text-[13px] mt-0.5">{sidebar.closedDayText}</p>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/25 mb-1 sm:mb-1.5">Appointments</p>
                  <p className="text-white/60 text-[13px] sm:text-[14px] md:text-[15px]">{sidebar.appointmentLine1}</p>
                  <p className="text-white/60 text-[13px] sm:text-[14px] md:text-[15px]">{sidebar.appointmentLine2}</p>
                </div>
              </div>

              <div className="h-px bg-white/[0.06] mb-6 sm:mb-8 md:mb-10" />

              <div>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/25 mb-3 sm:mb-4">{sidebar.followUsLabel}</p>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {socials.map((social) => (
                    <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-white/[0.08] text-white/30 hover:text-white hover:border-gold/40 hover:bg-gold/10 transition-all duration-300" aria-label={social.name}>
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 md:pt-10 border-t border-white/[0.06]"
            >
              <blockquote className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl text-white/20 italic leading-relaxed">
                &ldquo;{sidebar.brandQuote}&rdquo;
              </blockquote>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
