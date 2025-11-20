import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Horibol – Affordable Smartphones & Electronics",
  description:
    "Horibol is an ecommerce platform for affordable smartphones, batteries, and electronic appliances.",
};

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-9 w-9 rounded-2xl overflow-hidden">
            <Image
              src="/horibol-logo.png"
              alt="Horibol logo"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <span className="text-xl font-semibold tracking-tight">Horibol</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/about" className="hover:text-black">
            About
          </Link>
          <Link href="/privacy-policy" className="hover:text-black">
            Privacy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-black">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-black">
            Contact
          </Link>
          <a
            href="https://horibol.com"
            className="rounded-full bg-yellow-400 px-4 py-1.5 text-sm font-semibold text-black shadow-sm hover:bg-yellow-300"
          >
            Open App
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-gray-600 md:flex-row md:items-center md:justify-between md:px-6">
        <p>© {year} Horibol. All rights reserved.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/shipping-and-delivery-policy" className="hover:text-black">
            Shipping
          </Link>
          <Link href="/refund-and-return-policy" className="hover:text-black">
            Refund & Return
          </Link>
          <Link
            href="/cancellation-and-replacement-policy"
            className="hover:text-black"
          >
            Cancellation
          </Link>
          <Link href="/privacy-policy" className="hover:text-black">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-black">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
