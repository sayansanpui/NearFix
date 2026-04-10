import { useEffect, useState } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../features/auth'
import { cancelBooking, createReview, getMyBookings, type BookingWithWorker } from '../services/customerFlowService'

export function MyBookingsPage() {
  const { profile } = useAuth()
  const [bookings, setBookings] = useState<BookingWithWorker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submittingBookingId, setSubmittingBookingId] = useState<string | null>(null)
  const [reviewState, setReviewState] = useState<Record<string, { rating: number; review: string; punctuality: number; work_quality: number; behavior: number }>>({})

  useEffect(() => {
    if (!profile) {
      return
    }

    const activeProfile = profile

    async function loadBookings() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getMyBookings(activeProfile.id)
        setBookings(data)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load bookings.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadBookings()
  }, [profile])

  async function handleCancel(bookingId: string, slotId: string) {
    setSubmittingBookingId(bookingId)
    setError(null)
    try {
      await cancelBooking({ bookingId, slotId })
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? { ...booking, status: 'CANCELLED' } : booking)))
    } catch (cancelError) {
      const message = cancelError instanceof Error ? cancelError.message : 'Unable to cancel booking.'
      setError(message)
    } finally {
      setSubmittingBookingId(null)
    }
  }

  async function handleReviewSubmit(booking: BookingWithWorker) {
    if (!profile) {
      return
    }

    const draft = reviewState[booking.id] ?? {
      rating: 5,
      review: '',
      punctuality: 5,
      work_quality: 5,
      behavior: 5,
    }

    setSubmittingBookingId(booking.id)
    setError(null)

    try {
      await createReview({
        bookingId: booking.id,
        workerId: booking.worker_id,
        customerId: profile.id,
        rating: draft.rating,
        review: draft.review,
        punctuality: draft.punctuality,
        work_quality: draft.work_quality,
        behavior: draft.behavior,
      })
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to submit review.'
      setError(message)
    } finally {
      setSubmittingBookingId(null)
    }
  }

  function updateReviewField(bookingId: string, field: 'rating' | 'review' | 'punctuality' | 'work_quality' | 'behavior', value: number | string) {
    setReviewState((current) => ({
      ...current,
      [bookingId]: {
        ...current[bookingId],
        rating: current[bookingId]?.rating ?? 5,
        review: current[bookingId]?.review ?? '',
        punctuality: current[bookingId]?.punctuality ?? 5,
        work_quality: current[bookingId]?.work_quality ?? 5,
        behavior: current[bookingId]?.behavior ?? 5,
        [field]: value,
      },
    }))
  }

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading your bookings...</p>
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Bookings</h1>
        <p className="mt-2 text-slate-600">Track status, cancel active bookings, and submit reviews after completion.</p>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{booking.worker_name}</h2>
                <p className="text-sm text-slate-600">{booking.worker_category} • {booking.worker_service_area}</p>
                <p className="mt-1 text-sm text-slate-500">{booking.slot_date} • {booking.slot_start_time} - {booking.slot_end_time}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{booking.description}</p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-700">Price: <span className="font-semibold">INR {booking.price}</span></p>

              {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') ? (
                <button
                  type="button"
                  onClick={() => void handleCancel(booking.id, booking.slot_id)}
                  disabled={submittingBookingId === booking.id}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed"
                >
                  {submittingBookingId === booking.id ? 'Cancelling...' : 'Cancel booking'}
                </button>
              ) : null}
            </div>

            {booking.status === 'COMPLETED' ? (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-900">Submit review</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  <label className="text-xs text-slate-600">
                    Rating
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={reviewState[booking.id]?.rating ?? 5}
                      onChange={(event) => updateReviewField(booking.id, 'rating', Number(event.target.value))}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Punctuality
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={reviewState[booking.id]?.punctuality ?? 5}
                      onChange={(event) => updateReviewField(booking.id, 'punctuality', Number(event.target.value))}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Work quality
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={reviewState[booking.id]?.work_quality ?? 5}
                      onChange={(event) => updateReviewField(booking.id, 'work_quality', Number(event.target.value))}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Behavior
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={reviewState[booking.id]?.behavior ?? 5}
                      onChange={(event) => updateReviewField(booking.id, 'behavior', Number(event.target.value))}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </label>
                </div>
                <textarea
                  value={reviewState[booking.id]?.review ?? ''}
                  onChange={(event) => updateReviewField(booking.id, 'review', event.target.value)}
                  rows={3}
                  placeholder="Share your feedback"
                  className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void handleReviewSubmit(booking)}
                  disabled={submittingBookingId === booking.id}
                  className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {submittingBookingId === booking.id ? 'Submitting review...' : 'Submit review'}
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {bookings.length === 0 ? <p className="text-sm text-slate-600">No bookings yet. Start by booking a worker.</p> : null}
    </section>
  )
}
