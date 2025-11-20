import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="border-b bg-gradient-to-b from-yellow-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr,1fr] md:px-6 md:py-20">
          <div className="flex flex-col justify-center gap-6">
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-700">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Horibol · Electronics made affordable
            </span>

            <h1 className="text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
              Smartphones & Electronics
              <span className="block text-yellow-500">at honest prices.</span>
            </h1>

            <p className="max-w-xl text-sm text-gray-600 sm:text-base">
              Horibol is an ecommerce platform for smartphones, batteries,
              accessories, and electronic appliances. Built in India, focused on
              value, transparency, and fast delivery.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://horibol.com"
                className="rounded-full bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-200 hover:bg-yellow-300"
              >
                Open Horibol App
              </a>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-800 underline-offset-4 hover:underline"
              >
                Learn more about us
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Secure payments
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Transparent return & refund policies
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Customer-first support
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm rounded-3xl bg-black p-6 text-white shadow-2xl shadow-yellow-200">
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-yellow-400">
                  <Image
                    src="/horibol-logo.png"
                    alt="Horibol logo"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">Horibol</p>
                  <p className="text-xs text-gray-300">
                    Electronics · Smartphones · Batteries
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-xs text-gray-200">
                <p>• Curated smartphones at fair prices</p>
                <p>• Genuine accessories & replacement batteries</p>
                <p>• Clear policies on returns, refunds & delivery</p>
              </div>
              <div className="mt-6 rounded-2xl bg-yellow-400/10 p-4 text-xs text-gray-100">
                <p className="font-semibold text-yellow-300">
                  Trust & Transparency
                </p>
                <p className="mt-1 text-[11px] text-gray-200">
                  Read our legal and policy pages to understand how Horibol
                  handles your data, payments, orders, and returns.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/privacy-policy"
                    className="rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-semibold text-black hover:bg-yellow-300"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/refund-and-return-policy"
                    className="rounded-full border border-yellow-400 px-3 py-1 text-[11px] font-semibold text-yellow-300 hover:bg-yellow-400/10"
                  >
                    Refund & Returns
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY SECTIONS */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">What we sell</h2>
            <p className="mt-2 text-sm text-gray-600">
              Smartphones, batteries, chargers, cables, audio accessories, and
              other everyday electronics.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">How we work</h2>
            <p className="mt-2 text-sm text-gray-600">
              Honest pricing, clear policies, and responsive support. No hidden
              fees or confusing terms.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Your protection</h2>
            <p className="mt-2 text-sm text-gray-600">
              Well-defined privacy, terms, refunds, shipping, and cancellation
              policies—public and easy to read.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-14">
          <h2 className="text-xl font-semibold md:text-2xl">
            Legal & Policy Overview
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Horibol is committed to operating as a transparent and compliant
            ecommerce business. All our important policies are published openly.
          </p>

          <div className="mt-6 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
            <Link
              href="/privacy-policy"
              className="flex items-start justify-between rounded-2xl border bg-gray-50 p-4 hover:border-yellow-400 hover:bg-yellow-50"
            >
              <div>
                <p className="font-semibold">Privacy Policy</p>
                <p className="mt-1 text-xs text-gray-600">
                  How we collect, use, store, and protect your personal data.
                </p>
              </div>
              <span className="text-xs text-gray-500">View →</span>
            </Link>

            <Link
              href="/terms-and-conditions"
              className="flex items-start justify-between rounded-2xl border bg-gray-50 p-4 hover:border-yellow-400 hover:bg-yellow-50"
            >
              <div>
                <p className="font-semibold">Terms & Conditions</p>
                <p className="mt-1 text-xs text-gray-600">
                  Rules for using Horibol, placing orders, and using our
                  services.
                </p>
              </div>
              <span className="text-xs text-gray-500">View →</span>
            </Link>

            <Link
              href="/refund-and-return-policy"
              className="flex items-start justify-between rounded-2xl border bg-gray-50 p-4 hover:border-yellow-400 hover:bg-yellow-50"
            >
              <div>
                <p className="font-semibold">Return & Refund Policy</p>
                <p className="mt-1 text-xs text-gray-600">
                  When and how you can request a return, replacement, or refund.
                </p>
              </div>
              <span className="text-xs text-gray-500">View →</span>
            </Link>

            <Link
              href="/shipping-and-delivery-policy"
              className="flex items-start justify-between rounded-2xl border bg-gray-50 p-4 hover:border-yellow-400 hover:bg-yellow-50"
            >
              <div>
                <p className="font-semibold">Shipping & Delivery</p>
                <p className="mt-1 text-xs text-gray-600">
                  Delivery timelines, coverage areas, and shipping charges.
                </p>
              </div>
              <span className="text-xs text-gray-500">View →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr,1fr]">
          <div>
            <h2 className="text-xl font-semibold md:text-2xl">
              Built for customers who care about clarity.
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We know that buying electronics online requires trust. That’s why
              we clearly explain our policies instead of hiding them in fine
              print.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>• Simple language, no legal jargon wherever possible.</li>
              <li>• Policies tailored for ecommerce electronics orders.</li>
              <li>• Easy access to contact and support details.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-black p-6 text-sm text-gray-100 shadow-lg shadow-yellow-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-400">
              Need help?
            </p>
            <p className="mt-2">
              If you have any questions about our policies or how your order
              will be handled, you can always reach out to us.
            </p>
            <p className="mt-3 text-sm font-medium text-white">
              Email: <span className="text-yellow-300">support@horibol.com</span>
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex rounded-full bg-yellow-400 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-300"
            >
              Go to Contact page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
