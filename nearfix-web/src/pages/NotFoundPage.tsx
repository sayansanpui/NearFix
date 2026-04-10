import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
      <h1 className="text-2xl font-semibold">Page Not Found</h1>
      <p className="mt-2">The requested route does not exist.</p>
      <Link to="/" className="mt-4 inline-block rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800">
        Back to home
      </Link>
    </section>
  )
}
