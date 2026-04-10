import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../features/auth'
import { createBooking, getWorkerDetails, type WorkerDetails } from '../services/customerFlowService'

export function BookWorkerPage() {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [worker, setWorker] = useState<WorkerDetails | null>(null)
  const [step, setStep] = useState(1)
  const [date, setDate] = useState('')
  const [slotId, setSlotId] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!workerId) {
      return
    }

    const selectedWorkerId = workerId

    async function loadWorker() {
      try {
        const details = await getWorkerDetails(selectedWorkerId)
        setWorker(details)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load worker details.'
        setError(message)
      }
    }

    void loadWorker()
  }, [workerId])

  const availableDates = useMemo(() => {
    if (!worker) {
      return []
    }

    return [...new Set(worker.slots.filter((slot) => !slot.is_booked).map((slot) => slot.date))]
  }, [worker])

  const availableSlots = useMemo(() => {
    if (!worker || !date) {
      return []
    }

    return worker.slots.filter((slot) => !slot.is_booked && slot.date === date)
  }, [worker, date])

  async function submitBooking() {
    if (!profile || !worker || !slotId || !description.trim()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createBooking({
        customerProfile: profile,
        workerId: worker.id,
        slotId,
        description: description.trim(),
        price: worker.starting_price,
      })
      navigate('/my-bookings', { replace: true })
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to create booking.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedSlot = availableSlots.find((slot) => slot.id === slotId)

  return (
    <section className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Booking flow</h1>
          <p className="text-sm text-slate-600">Step {step} of 4</p>
        </div>
        {worker ? <p className="text-sm text-slate-600">{worker.name} • {worker.category}</p> : null}
      </div>

      {!worker ? <p className="text-sm text-slate-600">Loading worker and slots...</p> : null}
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {worker ? (
        <>
          {step === 1 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">1. Choose date</h2>
              <div className="flex flex-wrap gap-2">
                {availableDates.map((slotDate) => (
                  <button
                    key={slotDate}
                    type="button"
                    onClick={() => {
                      setDate(slotDate)
                      setSlotId('')
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      date === slotDate ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {slotDate}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">2. Choose slot</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSlotId(slot.id)}
                    className={`rounded-lg border px-3 py-3 text-left text-sm ${
                      slotId === slot.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {slot.start_time} - {slot.end_time}
                  </button>
                ))}
              </div>
              {availableSlots.length === 0 ? <p className="text-sm text-slate-600">No open slots for the selected date.</p> : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">3. Issue description</h2>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Describe the issue clearly so the worker can prepare."
              />
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">4. Confirm booking</h2>
              <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
                <p><span className="font-semibold">Worker:</span> {worker.name}</p>
                <p><span className="font-semibold">Date:</span> {date}</p>
                <p><span className="font-semibold">Slot:</span> {selectedSlot ? `${selectedSlot.start_time} - ${selectedSlot.end_time}` : '-'}</p>
                <p><span className="font-semibold">Price:</span> INR {worker.starting_price}</p>
                <p className="mt-2"><span className="font-semibold">Issue:</span> {description || '-'}</p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <Link to={`/workers/${worker.id}`} className="text-sm font-medium text-slate-600 hover:text-slate-800">
              Back to profile
            </Link>
            <div className="flex gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => current - 1)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Previous
                </button>
              ) : null}
              {step < 4 ? (
                <button
                  type="button"
                  disabled={(step === 1 && !date) || (step === 2 && !slotId) || (step === 3 && !description.trim())}
                  onClick={() => setStep((current) => current + 1)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void submitBooking()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm booking'}
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
