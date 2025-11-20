import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions – Horibol",
  description:
    "Read the terms and conditions for using Horibol and placing orders.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-semibold text-gray-900">
        Terms &amp; Conditions
      </h1>
      <p className="mt-3 text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <p className="mt-4 text-sm text-gray-600">
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the
        Horibol mobile application, website, and services (collectively, the
        &quot;Services&quot;). By accessing or using Horibol, you agree to be
        bound by these Terms.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Eligibility</h2>
      <p className="mt-3 text-sm text-gray-600">
        You must be at least 18 years old and capable of entering into a legally
        binding contract under applicable laws to use Horibol and place orders.
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Account and security</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• You are responsible for all activities under your account.</li>
        <li>
          • You must provide accurate and complete information while creating
          your account and keep it updated.
        </li>
        <li>
          • You must keep your login credentials confidential and notify us
          immediately if you suspect unauthorised access.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">3. Products and pricing</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>
          • We strive to display accurate product information, specifications,
          and images. However, minor variations may occur.
        </li>
        <li>
          • Prices, offers and availability are subject to change without prior
          notice.
        </li>
        <li>
          • In case of obvious pricing errors, we reserve the right to cancel
          the order or contact you for confirmation before processing.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">4. Orders and payments</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• Placing an order constitutes an offer to purchase products.</li>
        <li>
          • An order is confirmed when payment is successfully completed and you
          receive an order confirmation.
        </li>
        <li>
          • We may cancel or refuse any order due to product unavailability,
          payment issues, suspected fraud, or incorrect information.
        </li>
        <li>
          • Payments are processed via third-party payment gateways and banking
          partners. We do not store your complete card information.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">5. Shipping and delivery</h2>
      <p className="mt-3 text-sm text-gray-600">
        Please refer to our{" "}
        <a
          href="/shipping-and-delivery-policy"
          className="font-medium text-yellow-700 underline-offset-2 hover:underline"
        >
          Shipping &amp; Delivery Policy
        </a>{" "}
        for details on expected delivery timelines, serviceable locations,
        shipping fees, and delivery attempts.
      </p>

      <h2 className="mt-8 text-xl font-semibold">6. Returns and refunds</h2>
      <p className="mt-3 text-sm text-gray-600">
        Returns, replacements, and refunds are governed by our{" "}
        <a
          href="/refund-and-return-policy"
          className="font-medium text-yellow-700 underline-offset-2 hover:underline"
        >
          Refund &amp; Return Policy
        </a>
        . Please review it carefully before placing an order.
      </p>

      <h2 className="mt-8 text-xl font-semibold">7. Prohibited activities</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• Misusing the app or website for illegal or fraudulent purposes.</li>
        <li>• Attempting to interfere with the security or integrity of Horibol.</li>
        <li>
          • Using automated tools or scraping data without our written consent.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">8. Limitation of liability</h2>
      <p className="mt-3 text-sm text-gray-600">
        To the maximum extent permitted by law, Horibol shall not be liable for
        any indirect, incidental, special, or consequential damages arising out
        of your use of the Services, including but not limited to loss of data,
        revenue, or profits.
      </p>

      <h2 className="mt-8 text-xl font-semibold">9. Changes to the Terms</h2>
      <p className="mt-3 text-sm text-gray-600">
        We may update these Terms from time to time. The revised version will be
        posted on this page with an updated date. Continued use of the Services
        after changes means you accept the updated Terms.
      </p>

      <h2 className="mt-8 text-xl font-semibold">10. Contact</h2>
      <p className="mt-3 text-sm text-gray-600">
        If you have any questions regarding these Terms, please contact us at{" "}
        <span className="font-medium text-gray-900">support@horibol.com</span>.
      </p>

      <p className="mt-6 text-xs text-gray-500">
        These Terms &amp; Conditions are a general template and may need to be
        reviewed by a legal professional to ensure compliance with the specific
        laws and regulations applicable to your business and jurisdiction.
      </p>
    </div>
  );
}
