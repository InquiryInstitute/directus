export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Commonplace
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Digital Scholarly Library & Publication System
        </p>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
          <p className="mb-4">
            Commonplace is the institutional memory system of Inquiry Institute.
          </p>
          <p className="mb-4">
            Browse our collection of living digital commonplace books, scholarly works,
            and author libraries.
          </p>
          <div className="mt-6">
            <a
              href="/authors"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Authors →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
