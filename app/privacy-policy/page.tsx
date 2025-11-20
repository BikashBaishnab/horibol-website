import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Horibol",
  description:
    "Read how Horibol collects, uses and protects your personal data when you use the app or website.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-semibold text-gray-900">Privacy Policy</h1>
      <p className="mt-3 text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString("en-IN")}
      </p>

      <p className="mt-4 text-sm text-gray-600">
        This Privacy Policy explains how Horibol ("we", "us", "our") collects,
        uses, discloses, and protects your information when you use our mobile
        application, website, and related services.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Information we collect</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• Account details like name, phone, email, addresses.</li>
        <li>• Order history, delivery details and payment status.</li>
        <li>• Device details: IP, OS, app version, logs.</li>
        <li>• Support messages and communication sent to us.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">2. How we use your data</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• To create and manage your Horibol account.</li>
        <li>• To deliver your orders and send updates.</li>
        <li>• To improve app performance and reliability.</li>
        <li>• To prevent fraud and comply with law enforcement.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">3. Sharing of information</h2>
      <p className="mt-3 text-sm text-gray-600">
        We do not sell your personal information. We may only share it with:
      </p>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li>• Delivery partners for order fulfilment.</li>
        <li>• Payment gateways to process secure payments.</li>
        <li>• Service providers who assist with analytics or support.</li>
        <li>• Government authorities if required by law.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">4. Security</h2>
      <p className="mt-3 text-sm text-gray-600">
        We use reasonable technical measures to protect your data. However, no
        method of transmission is 100% secure.
      </p>

      <h2 className="mt-8 text-xl font-semibold">5. Your rights</h2>
      <p className="mt-3 text-sm text-gray-600">
        You may request access, update or deletion of your personal information
        subject to applicable laws.
      </p>

      <h2 className="mt-8 text-xl font-semibold">6. Updates to this policy</h2>
      <p className="mt-3 text-sm text-gray-600">
        We may update this Privacy Policy from time to time. Continued use of
        our Services means acceptance of the updated policy.
      </p>

      <h2 className="mt-8 text-xl font-semibold">7. Contact us</h2>
      <p className="mt-3 text-sm text-gray-600">
        For any privacy-related queries, contact us at{" "}
        <span className="font-medium text-gray-900">support@horibol.com</span>.
      </p>
    </div>
  );
}
