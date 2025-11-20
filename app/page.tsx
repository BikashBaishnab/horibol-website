export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-bold text-gray-900">Horibol</h1>

      <p className="text-lg text-gray-600 mt-4">
        Affordable Smartphones & Electronics
      </p>

      <p className="text-center text-gray-500 mt-2 max-w-xl">
        Horibol is a trusted ecommerce brand delivering mobile phones, batteries,
        accessories, and electronic appliances at unbeatable prices.
      </p>

      <a
        href="https://horibol.com"
        className="mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        Visit Main App
      </a>
    </main>
  );
}
