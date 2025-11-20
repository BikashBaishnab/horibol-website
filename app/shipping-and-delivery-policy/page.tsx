import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy – Horibol",
  description:
    "Learn about Horibol’s delivery timelines, shipping areas, charges, and methods.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-semibold text-gray-900">
        Shipping &amp; Delivery Policy
      </h1>

      <p className="mt-3 text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <p className="mt-4 text-sm text-gray-600">
        Horibol partners with trusted courier and delivery services to provide
        safe and timely delivery of orders across India.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Delivery areas</h2>
      <p className="mt-3 text-sm text-gray-600">
        We currently deliver to all major cities, towns, and serviceable PIN
        codes across India.
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Delivery timelines</h2>
      <p className="mt-3 text-sm text-gray-600">Typical delivery times:</p>
      <ul className="mt-2 space-y-2 text-sm text-gray-700">
        <li>• Metro cities: 2–4 working days</li>
        <li>• Tier 2 &amp; Tier 3 cities: 3–6 working days</li>
        <li>• Remote areas: 5–10 working days</li>
      </ul>

      <p className="mt-3 text-sm text-gray-600">
        Delivery times may vary due to public holidays, weather, or courier
        delays.
      </p>

      <h2 className="mt-8 text-xl font-semibold">3. Shipping charges</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• Free delivery on most products.</li>
        <li>
          • Certain products or remote locations may have an additional
          shipping charge, shown during checkout.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">4. Order tracking</h2>
      <p className="mt-3 text-sm text-gray-600">
        Once your order is shipped, you will receive a tracking link via SMS or
        email. You can use this link to track the status of your shipment.
      </p>

      <h2 className="mt-8 text-xl font-semibold">5. Delivery attempts</h2>
      <p className="mt-3 text-sm text-gray-600">
        The courier partner will make up to 2–3 attempts to deliver your order.
        If the delivery fails due to an incorrect address or unavailability, the
        order may be returned to us.
      </p>

      <h2 className="mt-8 text-xl font-semibold">6. Damaged deliveries</h2>
      <p className="mt-3 text-sm text-gray-600">
        If the package appears damaged, tampered or opened at the time of
        delivery:
      </p>
      <ul className="mt-2 space-y-1 text-sm text-gray-700">
        <li>• Please refuse to accept the order.</li>
        <li>
          • Immediately contact us at{" "}
          <span className="font-medium">support@horibol.com</span>.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">7. Incorrect address</h2>
      <p className="mt-3 text-sm text-gray-600">
        Orders may be cancelled or delayed if the shipping address is inaccurate
        or incomplete. Customers are responsible for providing correct details.
      </p>
    </div>
  );
}
