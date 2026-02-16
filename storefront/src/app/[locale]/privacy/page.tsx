import { Metadata } from "next";
import Link from "next/link";
import { CONTACT_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Aksa Fashion collects, uses, and protects your personal data in compliance with Kosovo's Law on Protection of Personal Data.",
};

export default function PrivacyPolicyPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4 text-center">
        Legal
      </p>
      <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-4 text-center">
        Privacy Policy
      </h1>
      <p className="text-charcoal/50 text-center mb-12">
        Last updated: February 16, 2026
      </p>

      <div className="prose-legal space-y-10 text-charcoal/70 leading-relaxed text-[15px]">
        {/* 1 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            1. Introduction
          </h2>
          <p>
            Aksa Fashion (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
            a business registered and operating in Prishtina, Republic of
            Kosovo, is committed to protecting your personal data. This Privacy
            Policy explains how we collect, use, store, and disclose your
            information when you visit our website or make a purchase.
          </p>
          <p className="mt-3">
            We process personal data in accordance with the{" "}
            <strong className="text-charcoal">
              Law No. 06/L-082 on Protection of Personal Data
            </strong>{" "}
            of the Republic of Kosovo, which is aligned with the General Data
            Protection Regulation (GDPR) of the European Union, as well as
            applicable subsidiary legislation enforced by the Information and
            Privacy Agency of Kosovo.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            2. Data Controller
          </h2>
          <p>The data controller responsible for your personal data is:</p>
          <div className="mt-3 p-5 bg-white border border-soft-gray/50">
            <p className="text-charcoal font-medium">Aksa Fashion</p>
            <p>{CONTACT_INFO.address}</p>
            <p>Email: {CONTACT_INFO.email}</p>
            <p>Phone: {CONTACT_INFO.phone}</p>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            3. Information We Collect
          </h2>
          <p>We collect the following categories of personal data:</p>
          <ul className="mt-3 space-y-2 list-none">
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Identity data:</strong> first
              name, last name
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Contact data:</strong> email
              address, phone number, shipping and billing address
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Transaction data:</strong>{" "}
              order details, payment information (processed securely by Stripe;
              we do not store card numbers)
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Technical data:</strong> IP
              address, browser type, device information, pages visited, and
              cookies
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Communication data:</strong>{" "}
              messages you send us via contact forms, email, or WhatsApp
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Body measurement data:</strong>{" "}
              measurements provided by you for made-to-order garments
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            4. Legal Basis for Processing
          </h2>
          <p>
            Under Article 6 of Law No. 06/L-082, we process your data on the
            following legal grounds:
          </p>
          <ul className="mt-3 space-y-2 list-none">
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">
                Performance of a contract:
              </strong>{" "}
              processing orders, shipping, and providing customer service
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Consent:</strong> sending
              marketing emails and newsletters (you may withdraw consent at any
              time)
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Legitimate interest:</strong>{" "}
              improving our website, preventing fraud, and understanding
              customer preferences
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Legal obligation:</strong>{" "}
              complying with tax, accounting, and regulatory requirements under
              Kosovo law
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            5. How We Use Your Data
          </h2>
          <p>We use your personal data to:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside marker:text-gold/50">
            <li>Process and fulfill your orders, including made-to-order garments</li>
            <li>Communicate with you about your order status</li>
            <li>Provide personalized styling consultations</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our website, products, and services</li>
            <li>Comply with legal and regulatory obligations</li>
            <li>Prevent fraudulent transactions</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            6. Data Sharing and Transfers
          </h2>
          <p>
            We may share your personal data with the following third parties,
            solely to the extent necessary to provide our services:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside marker:text-gold/50">
            <li>
              <strong className="text-charcoal">Payment processors:</strong>{" "}
              Stripe, for secure payment handling
            </li>
            <li>
              <strong className="text-charcoal">Shipping providers:</strong>{" "}
              to deliver your orders
            </li>
            <li>
              <strong className="text-charcoal">Hosting providers:</strong>{" "}
              Vercel and Railway, for website and backend infrastructure
            </li>
            <li>
              <strong className="text-charcoal">Analytics services:</strong>{" "}
              to understand website usage (anonymized where possible)
            </li>
          </ul>
          <p className="mt-3">
            Where data is transferred outside of Kosovo, we ensure appropriate
            safeguards are in place in compliance with Article 37 of Law No.
            06/L-082, including transfers to countries with adequate data
            protection standards or through contractual clauses.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            7. Data Retention
          </h2>
          <p>
            We retain your personal data only for as long as necessary to
            fulfill the purposes for which it was collected:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside marker:text-gold/50">
            <li>Order and transaction data: 6 years (as required by Kosovo fiscal law)</li>
            <li>Account data: until you request deletion</li>
            <li>Marketing preferences: until you withdraw consent</li>
            <li>Body measurement data: 2 years after last order, or upon request</li>
          </ul>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            8. Your Rights
          </h2>
          <p>
            Under Law No. 06/L-082, you have the following rights regarding
            your personal data:
          </p>
          <ul className="mt-3 space-y-2 list-none">
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Right of access:</strong> obtain
              confirmation of whether your data is being processed and receive a
              copy
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Right to rectification:</strong>{" "}
              request correction of inaccurate data
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Right to erasure:</strong>{" "}
              request deletion of your data where no longer necessary
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">
                Right to restrict processing:
              </strong>{" "}
              limit how we use your data in certain circumstances
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">
                Right to data portability:
              </strong>{" "}
              receive your data in a structured, machine-readable format
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Right to object:</strong> object
              to processing based on legitimate interest or for direct marketing
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">
                Right to withdraw consent:
              </strong>{" "}
              at any time, without affecting the lawfulness of prior processing
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="text-gold hover:text-gold-dark transition-colors"
            >
              {CONTACT_INFO.email}
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            9. Cookies
          </h2>
          <p>
            Our website uses cookies and similar technologies to enhance your
            browsing experience:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside marker:text-gold/50">
            <li>
              <strong className="text-charcoal">Essential cookies:</strong>{" "}
              required for the website to function (cart, session, language
              preference)
            </li>
            <li>
              <strong className="text-charcoal">Analytics cookies:</strong>{" "}
              help us understand how visitors use our site
            </li>
          </ul>
          <p className="mt-3">
            You can manage cookie preferences through your browser settings.
            Disabling essential cookies may affect website functionality.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            10. Security
          </h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal data against unauthorized access, alteration,
            disclosure, or destruction. All payment transactions are encrypted
            via SSL/TLS and processed through PCI-DSS compliant services.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            11. Complaints
          </h2>
          <p>
            If you believe your data protection rights have been violated, you
            have the right to lodge a complaint with:
          </p>
          <div className="mt-3 p-5 bg-white border border-soft-gray/50">
            <p className="text-charcoal font-medium">
              Information and Privacy Agency of Kosovo
            </p>
            <p>Agjencia e Informimit dhe e Privatësisë (AIP)</p>
            <p>Prishtina, Republic of Kosovo</p>
            <p>
              Website:{" "}
              <span className="text-gold">www.aip-ks.org</span>
            </p>
          </div>
        </section>

        {/* 12 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            12. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will
            be posted on this page with an updated revision date. We encourage
            you to review this page periodically.
          </p>
        </section>

        {/* 13 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            13. Contact Us
          </h2>
          <p>
            For any questions about this Privacy Policy or your personal data,
            please contact us:
          </p>
          <div className="mt-3 p-5 bg-white border border-soft-gray/50">
            <p className="text-charcoal font-medium">Aksa Fashion</p>
            <p>{CONTACT_INFO.address}</p>
            <p>
              Email:{" "}
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="text-gold hover:text-gold-dark transition-colors"
              >
                {CONTACT_INFO.email}
              </a>
            </p>
            <p>Phone: {CONTACT_INFO.phone}</p>
          </div>
        </section>

        {/* Back link */}
        <div className="pt-6 border-t border-soft-gray/50 text-center">
          <Link
            href={`/${locale}`}
            className="text-gold hover:text-gold-dark text-sm transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
