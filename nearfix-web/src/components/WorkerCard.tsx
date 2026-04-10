import { Link } from 'react-router-dom'
import type { WorkerSummary } from '../services/customerFlowService'

export function WorkerCard({ worker }: { worker: WorkerSummary }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <img src={worker.avatar_url} alt={worker.name} className="h-14 w-14 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900">{worker.name}</h3>
            {worker.verified ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Verified</span> : null}
          </div>
          <p className="text-sm text-slate-600">{worker.category} • {worker.experience} yrs</p>
          <p className="mt-1 text-sm text-slate-500">{worker.service_area}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{worker.bio}</p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-slate-100 px-2 py-2 text-center">
          <p className="text-xs text-slate-500">Rating</p>
          <p className="font-semibold text-slate-900">{worker.rating.toFixed(1)}</p>
        </div>
        <div className="rounded-lg bg-slate-100 px-2 py-2 text-center">
          <p className="text-xs text-slate-500">Jobs</p>
          <p className="font-semibold text-slate-900">{worker.jobs_completed}</p>
        </div>
        <div className="rounded-lg bg-slate-100 px-2 py-2 text-center">
          <p className="text-xs text-slate-500">Today</p>
          <p className="font-semibold text-slate-900">{worker.available_today}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-700">From <span className="font-semibold">INR {worker.starting_price}</span></p>
        <div className="flex gap-2">
          <Link to={`/workers/${worker.id}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            View
          </Link>
          <Link to={`/book/${worker.id}`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
            Book
          </Link>
        </div>
      </div>
    </article>
  )
}
