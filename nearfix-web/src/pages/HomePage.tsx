import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkerCard } from '../components/WorkerCard'
import { SERVICE_CATEGORIES } from '../lib/categories'
import { getTopRatedWorkers, type WorkerSummary } from '../services/customerFlowService'

const trustPoints = ['Verified local workers', 'Transparent pricing', 'Secure booking records']

export function HomePage() {
  const [workers, setWorkers] = useState<WorkerSummary[]>([])

  useEffect(() => {
    async function loadTopWorkers() {
      const topWorkers = await getTopRatedWorkers(3)
      setWorkers(topWorkers)
    }

    void loadTopWorkers()
  }, [])

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 text-white sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative max-w-3xl space-y-5">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">NearFix</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Book trusted local skilled workers in minutes</h1>
          <p className="max-w-2xl text-sm text-slate-200 sm:text-base">
            From electricians and plumbers to AC and appliance repair, discover verified professionals near you and confirm appointments without the usual back-and-forth.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/workers" className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">
              Find Workers
            </Link>
            <Link to="/categories" className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Category shortcuts</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SERVICE_CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/workers?category=${encodeURIComponent(category)}`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">How it works</h3>
          <p className="mt-1 text-sm text-slate-600">Choose a service, compare workers, and book a slot.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Track every step</h3>
          <p className="mt-1 text-sm text-slate-600">Bookings move from pending to completed with status updates.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Rate after service</h3>
          <p className="mt-1 text-sm text-slate-600">Leave detailed reviews once the job is completed.</p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Top rated workers</h2>
          <Link to="/workers" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Trust section</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {trustPoints.map((point) => (
            <li key={point} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-blue-700 px-6 py-8 text-center text-white">
        <h2 className="text-2xl font-semibold">Need help today?</h2>
        <p className="mt-2 text-blue-100">Find available workers near your area and confirm your slot now.</p>
        <Link to="/workers" className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50">
          Start booking
        </Link>
      </section>
    </div>
  )
}
