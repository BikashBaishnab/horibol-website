import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Replacement Policy – Horibol",
  description:
    "Learn how to cancel orders, request replacements, and understand order restrictions.",
};

export default function CancellationPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-semibold text-gray-900">
        Cancellation &amp; Replacement Policy
      </h1>

      <p className="mt-3 text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <p className="mt-4 text-sm text-gray-600">
        We understand that situations may arise where you wish to cancel or
        modify your order. This policy outlines the guidelines for cancellations
        and replacements.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Order cancellation</h2>
      <p className="mt-3 text-sm text-gray-600">
        You may cancel an order within:
      </p>
      <ul className="mt-2 space-y-2 text-sm text-gray-700">
        <li>• <strong>1 hour</strong> after placing the order, OR</li>
        <li>• Before the order is shipped.</li>
      </ul>

      <p className="mt-4 text-sm text-gray-600">
        Once shipped, the order cannot be cancelled. However, you may request a
        return or replacement after delivery based on our Return Policy.
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Replacement requests</h2>
      <p className="mt-3 text-sm text-gray-600">
        You may request a replacement if:
      </p>
      <ul className="mt-2 space-y-2 text-sm text-gray-700">
        <li>• The product received is defective.</li>
        <li>• The product delivered is incorrect.</li>
        <li>• The item is damaged during transit.</li>
      </ul>

      <p className="mt-3 text-sm text-gray-600">
        Replacements depend on stock availability. If a replacement is not
        available, we will issue a refund.
      </p>

      <h2 className="mt-8 text-xl font-semibold">3. Situations where cancellation is not allowed</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• Orders already shipped or out for delivery.</li>
        <li>• Products damaged after delivery due to customer misuse.</li>
        <li>• Items used, unboxed, or missing accessories.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">4. How to request</h2>
      <p className="mt-3 text-sm text-gray-600">
        To cancel or request a replacement, email us at{" "}
        <span className="font-medium">support@horibol.com</span> with:
      </p>
      <ul className="mt-2 space-y-1 text-sm text-gray-700">
        <li>• Order ID</li>
        <li>• Reason for cancellation/replacement</li>
        <li>• Photos/videos (for defective or damaged items)</li>
      </ul>
    </div>
  );
}
