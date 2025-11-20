import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Horibol",
  description:
    "Learn about Horibol, an ecommerce platform for smartphones and electronics.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-semibold text-gray-900">About Horibol</h1>
      <p className="mt-3 text-sm text-gray-600">
        Horibol is an ecommerce platform focused on delivering smartphones,
        batteries, accessories, and electronic appliances at fair and
        transparent prices. We aim to remove confusion around electronics
        shopping by combining honest pricing, clear communication, and simple
        policies.
      </p>

      <h2 className="mt-8 text-xl font-semibold">What we stand for</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• Affordability without compromising on quality.</li>
        <li>• Clear policies that are easy to understand.</li>
        <li>• Fast and reliable support for customers.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">What you can buy on Horibol</h2>
      <p className="mt-3 text-sm text-gray-600">
        Horibol focuses on key everyday electronics:
      </p>
      <ul className="mt-2 space-y-2 text-sm text-gray-700">
        <li>• Smartphones and feature phones.</li>
        <li>• Mobile phone batteries and power-related accessories.</li>
        <li>• Chargers, cables, earphones, and basic electronics.</li>
        <li>• Other essential electronic items and appliances over time.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Our promise</h2>
      <p className="mt-3 text-sm text-gray-600">
        We believe that trust is built through transparency. Every page of this
        website—our terms, privacy policy, refund rules, and shipping
        conditions—is written to give you clarity on how Horibol works behind
        the scenes.
      </p>

      <p className="mt-6 text-sm text-gray-600">
        If you ever feel something is unclear or if you have suggestions to
        improve your experience, please reach out to us at{" "}
        <span className="font-medium text-gray-900">support@horibol.com</span>.
      </p>
    </div>
  );
}
