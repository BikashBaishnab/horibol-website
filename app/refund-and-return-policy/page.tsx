import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Return Policy – Horibol",
  description:
    "Read Horibol’s clear and customer-friendly return, replacement, and refund policy.",
};

export default function RefundAndReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-semibold text-gray-900">
        Refund &amp; Return Policy
      </h1>

      <p className="mt-3 text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <p className="mt-4 text-sm text-gray-600">
        Thank you for shopping with Horibol. We aim to ensure a smooth and
        reliable shopping experience. This Refund &amp; Return Policy explains
        when and how returns, replacements, and refunds can be requested.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Eligibility for returns</h2>
      <p className="mt-3 text-sm text-gray-600">
        Returns or replacements may be accepted under the following conditions:
      </p>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• You received a damaged or defective product.</li>
        <li>• You received the wrong product or variant.</li>
        <li>• The product is not functioning as described.</li>
      </ul>

      <p className="mt-4 text-sm text-gray-600">
        To be eligible, the product must be returned in the original condition
        with all box contents, accessories, and packaging.
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Non-returnable items</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• Used earphones / headphones for hygiene reasons.</li>
        <li>• Physical screen damage caused after delivery.</li>
        <li>• Water-damaged or customer-damaged items.</li>
        <li>• Items without their original box or accessories.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">
        3. Return window and process
      </h2>
      <p className="mt-3 text-sm text-gray-600">
        You must request a return or replacement within:
      </p>
      <ul className="mt-2 space-y-2 text-sm text-gray-700">
        <li>• <strong>48 hours</strong> for damaged or defective products.</li>
        <li>• <strong>72 hours</strong> for wrong product/variant delivered.</li>
      </ul>

      <p className="mt-4 text-sm text-gray-600">
        Email us at{" "}
        <span className="font-medium">support@horibol.com</span> with:
      </p>
      <ul className="mt-2 space-y-1 text-sm text-gray-700">
        <li>• Order ID</li>
        <li>• Product name</li>
        <li>• Issue description</li>
        <li>• Photos/video of the issue</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">4. Refund process</h2>
      <p className="mt-3 text-sm text-gray-600">
        Refunds are issued only after:
      </p>
      <ul className="mt-2 space-y-2 text-sm text-gray-700">
        <li>• The product is returned and inspected.</li>
        <li>• Quality check is passed for genuine issues.</li>
      </ul>

      <p className="mt-3 text-sm text-gray-600">
        Refund timeline:
        <br />
        • <strong>3–7 business days</strong> for UPI/wallet refunds<br />
        • <strong>7–10 business days</strong> for bank refunds
      </p>

      <h2 className="mt-8 text-xl font-semibold">5. Replacement process</h2>
      <p className="mt-3 text-sm text-gray-600">
        Eligible products will be replaced with the same or similar model
        depending on availability. If a replacement is not possible, we will
        issue a refund instead.
      </p>

      <h2 className="mt-8 text-xl font-semibold">6. Contact</h2>
      <p className="mt-3 text-sm text-gray-600">
        If you need help with a return or refund, contact us at{" "}
        <span className="font-medium">support@horibol.com</span>.
      </p>
    </div>
  );
}
