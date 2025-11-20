import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us – Horibol",
  description: "Get in touch with the Horibol support team for assistance.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-semibold text-gray-900">Contact Us</h1>

      <p className="mt-4 text-sm text-gray-600">
        We're here to help! If you have any questions related to your order,
        returns, refunds, policies, or anything else, feel free to reach out.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Customer Support</h2>
        <p className="text-sm text-gray-700">
          Email us at:{" "}
          <span className="font-medium text-gray-900">
            support@horibol.com
          </span>
        </p>

        <p className="mt-3 text-xs text-gray-600">
          We typically respond within 24–48 hours.
        </p>
      </div>

      <h2 className="mt-12 text-xl font-semibold">Business & Corporate</h2>
      <p className="mt-2 text-sm text-gray-600">
        For business partnerships, vendor onboarding or corporate enquiries,
        contact us via the same email with the subject line:
        <br />
        <span className="font-medium text-gray-900">“Business Enquiry – Horibol”</span>
      </p>
    </div>
  );
}
