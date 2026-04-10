import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getWorkerDetails, type WorkerDetails } from '../services/customerFlowService'

export function WorkerDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [worker, setWorker] = useState<WorkerDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Worker id is missing.')
      setIsLoading(false)
      return
    }

    const workerId = id

    async function loadWorker() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getWorkerDetails(workerId)
        setWorker(data)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load worker profile.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadWorker()
  }, [id])

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading worker profile...</p>
  }

  if (error || !worker) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error ?? 'Worker not found.'}</p>
  }

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <img src={worker.avatar_url} alt={worker.name} className="h-20 w-20 rounded-2xl object-cover" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{worker.name}</h1>
              <p className="mt-1 text-slate-600">{worker.category} • {worker.experience} years experience</p>
              <p className="mt-2 text-sm text-slate-600">{worker.service_area}</p>
            </div>
          </div>
          <Link to={`/book/${worker.id}`} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Book Now
          </Link>
        </div>

        <p className="mt-5 text-slate-700">{worker.bio}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-100 p-3 text-center">
            <p className="text-xs text-slate-500">Average rating</p>
            <p className="text-lg font-semibold text-slate-900">{worker.average_rating.toFixed(1)}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 text-center">
            <p className="text-xs text-slate-500">Completed jobs</p>
            <p className="text-lg font-semibold text-slate-900">{worker.jobs_completed}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 text-center">
            <p className="text-xs text-slate-500">Starting price</p>
            <p className="text-lg font-semibold text-slate-900">INR {worker.starting_price}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 text-center">
            <p className="text-xs text-slate-500">Available slots</p>
            <p className="text-lg font-semibold text-slate-900">{worker.slots.filter((slot) => !slot.is_booked).length}</p>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Available slots</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {worker.slots.slice(0, 8).map((slot) => (
            <div key={slot.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <p className="font-semibold">{slot.date}</p>
              <p>{slot.start_time} - {slot.end_time}</p>
              <p className={slot.is_booked ? 'text-red-600' : 'text-emerald-600'}>{slot.is_booked ? 'Booked' : 'Available'}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Ratings & reviews</h2>
        <div className="mt-4 space-y-3">
          {worker.reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{review.customer_name}</p>
                <p className="text-sm text-slate-600">{review.rating.toFixed(1)} / 5</p>
              </div>
              <p className="mt-2 text-sm text-slate-700">{review.review || 'No comment provided.'}</p>
              <p className="mt-1 text-xs text-slate-500">
                Punctuality {review.punctuality} • Work quality {review.work_quality} • Behavior {review.behavior}
              </p>
            </div>
          ))}
          {worker.reviews.length === 0 ? <p className="text-sm text-slate-600">No reviews yet.</p> : null}
        </div>
      </article>
    </section>
  )
}
