import { Metadata } from "next";
import Link from "next/link";
import { getSiteConstants } from "@/lib/data/content-blocks";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions governing purchases from Aksa Fashion, in accordance with the laws of the Republic of Kosovo.",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const sc = await getSiteConstants();
  const CONTACT_INFO = { email: sc.email, phone: sc.phone, address: sc.address, hours: sc.hours };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
      <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4 text-center">
        Legal
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-4 text-center">
        Terms &amp; Conditions
      </h1>
      <p className="text-charcoal/50 text-center mb-8 sm:mb-12">
        Last updated: February 16, 2026
      </p>

      <div className="prose-legal space-y-10 text-charcoal/70 leading-relaxed text-[15px]">
        {/* 1 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            1. General Provisions
          </h2>
          <p>
            These Terms and Conditions (&quot;Terms&quot;) govern the use of
            the Aksa Fashion website and the purchase of products from Aksa
            Fashion (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a
            business registered and operating in Prishtina, Republic of Kosovo.
          </p>
          <p className="mt-3">
            By accessing our website or placing an order, you agree to be bound
            by these Terms. These Terms are governed by the laws of the
            Republic of Kosovo, including but not limited to:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside marker:text-gold/50">
            <li>
              <strong className="text-charcoal">
                Law No. 04/L-034 on Consumer Protection
              </strong>
            </li>
            <li>
              <strong className="text-charcoal">
                Law No. 06/L-016 on Obligational Relationships (Civil
                Obligations)
              </strong>
            </li>
            <li>
              <strong className="text-charcoal">
                Law No. 06/L-082 on Protection of Personal Data
              </strong>
            </li>
            <li>
              <strong className="text-charcoal">
                Law No. 06/L-034 on Electronic Commerce
              </strong>
            </li>
          </ul>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            2. Products and Orders
          </h2>
          <p>
            All products displayed on our website are subject to availability.
            We reserve the right to limit quantities, discontinue products, or
            modify descriptions and pricing without prior notice.
          </p>
          <ul className="mt-3 space-y-2 list-none">
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Made-to-order:</strong> Many of
              our gowns are made-to-order based on your body measurements.
              Production typically takes 2&ndash;5 business days.
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Custom alterations:</strong>{" "}
              Color, fabric, and design customizations are available upon
              request and may affect pricing and delivery time.
            </li>
            <li className="pl-4 border-l-2 border-gold/30">
              <strong className="text-charcoal">Order confirmation:</strong> An
              order is confirmed only when you receive a confirmation email
              from us. We reserve the right to refuse or cancel any order.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            3. Pricing and Payment
          </h2>
          <p>
            All prices are listed in Euros (&euro;) and include applicable
            taxes unless otherwise stated. Shipping costs are calculated at
            checkout.
          </p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside marker:text-gold/50">
            <li>We accept payment via Visa, Mastercard, American Express, PayPal, and Apple Pay</li>
            <li>Payments are processed securely through Stripe</li>
            <li>For made-to-order garments, a 50% deposit is required at the time of order; the remaining balance is due before shipping</li>
            <li>Prices may change at any time, but changes will not affect already confirmed orders</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            4. Shipping and Delivery
          </h2>
          <p>
            We deliver throughout Kosovo, Europe, and select international
            destinations.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left border border-soft-gray/50">
              <thead>
                <tr className="bg-white">
                  <th className="px-4 py-3 text-charcoal text-sm font-medium border-b border-soft-gray/50">
                    Method
                  </th>
                  <th className="px-4 py-3 text-charcoal text-sm font-medium border-b border-soft-gray/50">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-charcoal text-sm font-medium border-b border-soft-gray/50">
                    Delivery Time
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 border-b border-soft-gray/30">
                    Standard
                  </td>
                  <td className="px-4 py-3 border-b border-soft-gray/30">
                    &euro;15
                  </td>
                  <td className="px-4 py-3 border-b border-soft-gray/30">
                    3&ndash;5 business days
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border-b border-soft-gray/30">
                    Express
                  </td>
                  <td className="px-4 py-3 border-b border-soft-gray/30">
                    &euro;30
                  </td>
                  <td className="px-4 py-3 border-b border-soft-gray/30">
                    1&ndash;2 business days
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Free Shipping</td>
                  <td className="px-4 py-3">Complimentary</td>
                  <td className="px-4 py-3">
                    Orders over &euro;150
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Delivery times are estimates and not guaranteed. We are not liable
            for delays caused by shipping carriers, customs, or force majeure
            events. Risk of loss passes to you upon delivery to the carrier.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            5. No Refunds and No Returns
          </h2>
          <div className="p-5 bg-white border border-soft-gray/50">
            <p className="text-charcoal font-medium mb-2">
              All sales are final.
            </p>
            <p>
              Due to the made-to-order and custom-fitted nature of our gowns,
              we do not offer refunds or accept returns. Each garment is
              crafted specifically to your measurements and specifications.
            </p>
          </div>
          <p className="mt-3">
            In the unlikely event that you receive a defective or incorrect
            item, please contact us within 7 days of delivery at{" "}
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="text-gold hover:text-gold-dark transition-colors"
            >
              {CONTACT_INFO.email}
            </a>
            . We will assess the issue and, at our discretion, offer a repair,
            replacement, or store credit. This does not affect your statutory
            rights under Kosovo&apos;s Law on Consumer Protection (Law No.
            04/L-034), which provides protections for defective goods.
          </p>
          <p className="mt-3">
            Pursuant to Article 36 of Law No. 04/L-034, consumers have the
            right to a remedy for goods that do not conform to the contract of
            sale. This includes the right to have the goods brought into
            conformity, a price reduction, or contract termination for
            non-conforming goods.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            6. Right of Withdrawal (Distance Selling)
          </h2>
          <p>
            Under Kosovo&apos;s consumer protection framework and in alignment
            with EU Directive 2011/83/EU on consumer rights, you generally have
            the right to withdraw from a distance contract within 14 days
            without giving a reason.
          </p>
          <p className="mt-3">
            However, pursuant to the exceptions provided by law, the right of
            withdrawal does not apply to:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside marker:text-gold/50">
            <li>Goods made to the consumer&apos;s specifications or clearly personalized</li>
            <li>Goods that have been altered after delivery at the consumer&apos;s request</li>
          </ul>
          <p className="mt-3">
            As our gowns are made-to-order and custom-fitted, they fall under
            this exception. For non-customized, ready-to-wear items (if any),
            the 14-day withdrawal right applies, provided the item is unworn,
            undamaged, and in its original packaging.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            7. Intellectual Property
          </h2>
          <p>
            All content on this website &mdash; including text, photographs,
            graphics, logos, designs, and software &mdash; is the property of
            Aksa Fashion or its licensors and is protected under the{" "}
            <strong className="text-charcoal">
              Law No. 04/L-065 on Copyright and Related Rights
            </strong>{" "}
            of the Republic of Kosovo.
          </p>
          <p className="mt-3">
            You may not reproduce, distribute, modify, or publicly display any
            content from this website without our prior written consent.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            8. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by Kosovo law, Aksa Fashion shall
            not be liable for any indirect, incidental, special, or
            consequential damages arising from the use of our website or the
            purchase of our products.
          </p>
          <p className="mt-3">
            Our total liability for any claim related to a purchase shall not
            exceed the amount you paid for the specific product in question.
            Nothing in these Terms excludes or limits liability for death,
            personal injury caused by negligence, or fraud.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            9. Warranty and Conformity
          </h2>
          <p>
            In accordance with Law No. 04/L-034 on Consumer Protection, all
            goods must conform to the contract of sale. We warrant that our
            products are free from material defects in craftsmanship at the
            time of delivery.
          </p>
          <p className="mt-3">
            Minor variations in color, texture, or embellishment placement are
            inherent to handcrafted garments and do not constitute defects.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            10. Privacy
          </h2>
          <p>
            Your use of our website is also governed by our{" "}
            <Link
              href={`/${locale}/privacy`}
              className="text-gold hover:text-gold-dark transition-colors"
            >
              Privacy Policy
            </Link>
            , which describes how we collect, use, and protect your personal
            data in accordance with Law No. 06/L-082 on Protection of Personal
            Data.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            11. Electronic Commerce
          </h2>
          <p>
            This website operates in compliance with{" "}
            <strong className="text-charcoal">
              Law No. 06/L-034 on Electronic Commerce
            </strong>{" "}
            of the Republic of Kosovo. We provide clear information about our
            identity, products, pricing, and the steps to conclude a contract
            before you place an order.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            12. Dispute Resolution
          </h2>
          <p>
            We encourage you to contact us first at{" "}
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="text-gold hover:text-gold-dark transition-colors"
            >
              {CONTACT_INFO.email}
            </a>{" "}
            to resolve any dispute amicably.
          </p>
          <p className="mt-3">
            If a dispute cannot be resolved informally, it shall be subject to
            the exclusive jurisdiction of the competent courts of Prishtina,
            Republic of Kosovo. Consumers may also seek mediation or
            alternative dispute resolution in accordance with the{" "}
            <strong className="text-charcoal">
              Law No. 06/L-009 on Mediation
            </strong>
            .
          </p>
        </section>

        {/* 13 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            13. Force Majeure
          </h2>
          <p>
            Aksa Fashion shall not be liable for any failure or delay in
            performance caused by circumstances beyond our reasonable control,
            including but not limited to natural disasters, pandemic, war,
            government actions, disruptions in telecommunications or power
            supply, or carrier delays.
          </p>
        </section>

        {/* 14 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            14. Modifications
          </h2>
          <p>
            We reserve the right to modify these Terms at any time. Updated
            Terms will be posted on this page with a revised date. Continued
            use of the website after changes constitutes acceptance of the new
            Terms. Material changes will be communicated via email to
            registered customers.
          </p>
        </section>

        {/* 15 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            15. Severability
          </h2>
          <p>
            If any provision of these Terms is found to be invalid or
            unenforceable by a court of competent jurisdiction, the remaining
            provisions shall continue in full force and effect.
          </p>
        </section>

        {/* 16 */}
        <section>
          <h2 className="font-serif text-xl text-charcoal mb-3">
            16. Contact
          </h2>
          <p>
            For questions or concerns about these Terms, please contact us:
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
