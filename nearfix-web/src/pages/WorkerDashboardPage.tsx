import { useEffect, useMemo, useState } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../features/auth'
import {
  createWorkerSlot,
  deleteWorkerSlot,
  getWorkerDashboardData,
  updateBookingStatusForWorker,
  updateWorkerSlot,
  type WorkerDashboardBooking,
  type WorkerDashboardData,
  type WorkerManagedSlot,
} from '../services/workerDashboardService'

type SlotDraft = {
  date: string
  startTime: string
  endTime: string
}

function toDefaultSlotDraft(): SlotDraft {
  return {
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '10:00',
  }
}

export function WorkerDashboardPage() {
  const { profile } = useAuth()
  const [dashboard, setDashboard] = useState<WorkerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const [slotDraft, setSlotDraft] = useState<SlotDraft>(toDefaultSlotDraft)
  const [slotEditDrafts, setSlotEditDrafts] = useState<Record<string, SlotDraft>>({})

  useEffect(() => {
    if (!profile) {
      return
    }

    const activeProfile = profile

    async function loadDashboard() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getWorkerDashboardData(activeProfile.id)
        setDashboard(data)

        setSlotEditDrafts(
          data.slots.reduce<Record<string, SlotDraft>>((acc, slot) => {
            acc[slot.id] = {
              date: slot.date,
              startTime: slot.start_time,
              endTime: slot.end_time,
            }
            return acc
          }, {}),
        )
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load worker dashboard.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [profile])

  const ratingSummary = useMemo(() => {
    if (!dashboard) {
      return '0.0'
    }

    return dashboard.rating.toFixed(1)
  }, [dashboard])

  async function refreshDashboard() {
    if (!profile) {
      return
    }

    const nextData = await getWorkerDashboardData(profile.id)
    setDashboard(nextData)
  }

  async function handleBookingStatusUpdate(booking: WorkerDashboardBooking, nextStatus: 'CONFIRMED' | 'REJECTED' | 'COMPLETED') {
    if (!dashboard) {
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      await updateBookingStatusForWorker({
        bookingId: booking.id,
        workerId: dashboard.workerId,
        nextStatus,
      })
      await refreshDashboard()
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Unable to update booking.'
      setError(message)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleCreateSlot() {
    if (!dashboard) {
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      await createWorkerSlot({
        workerId: dashboard.workerId,
        date: slotDraft.date,
        startTime: slotDraft.startTime,
        endTime: slotDraft.endTime,
      })
      setSlotDraft(toDefaultSlotDraft())
      await refreshDashboard()
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : 'Unable to create slot.'
      setError(message)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleSaveSlot(slot: WorkerManagedSlot) {
    if (!dashboard) {
      return
    }

    const draft = slotEditDrafts[slot.id]
    if (!draft) {
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      await updateWorkerSlot({
        slotId: slot.id,
        workerId: dashboard.workerId,
        date: draft.date,
        startTime: draft.startTime,
        endTime: draft.endTime,
      })
      await refreshDashboard()
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Unable to update slot.'
      setError(message)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDeleteSlot(slot: WorkerManagedSlot) {
    if (!dashboard) {
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      await deleteWorkerSlot({
        slotId: slot.id,
        workerId: dashboard.workerId,
      })
      await refreshDashboard()
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Unable to delete slot.'
      setError(message)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading worker dashboard...</p>
  }

  if (error && !dashboard) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
  }

  if (!dashboard) {
    return <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">Worker profile not found.</p>
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Worker Dashboard</h1>
          <p className="mt-1 text-slate-600">Welcome, {dashboard.workerName}. Manage your requests, jobs, and availability.</p>
        </div>
        {isUpdating ? <p className="text-sm text-slate-500">Saving changes...</p> : null}
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Today bookings</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{dashboard.todayBookings.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Pending requests</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{dashboard.pendingRequests.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Completed jobs</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{dashboard.completedBookings.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Earnings (mock)</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">INR {dashboard.earningsMock.toFixed(0)}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Rating summary</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{ratingSummary}</p>
          <p className="text-xs text-slate-500">{dashboard.jobsCompleted} lifetime jobs</p>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Pending requests</h2>
        <div className="mt-4 space-y-3">
          {dashboard.pendingRequests.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{booking.customer_name}</p>
                  <p className="text-sm text-slate-600">{booking.slot_date} • {booking.slot_start_time} - {booking.slot_end_time}</p>
                  <p className="mt-1 text-sm text-slate-700">{booking.description}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleBookingStatusUpdate(booking, 'CONFIRMED')}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => void handleBookingStatusUpdate(booking, 'REJECTED')}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {dashboard.pendingRequests.length === 0 ? <p className="text-sm text-slate-600">No pending booking requests.</p> : null}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Today bookings</h2>
        <div className="mt-4 space-y-3">
          {dashboard.todayBookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{booking.customer_name}</p>
                  <p className="text-sm text-slate-600">{booking.slot_date} • {booking.slot_start_time} - {booking.slot_end_time}</p>
                  <p className="mt-1 text-sm text-slate-700">{booking.description}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              {booking.status === 'CONFIRMED' ? (
                <button
                  type="button"
                  onClick={() => void handleBookingStatusUpdate(booking, 'COMPLETED')}
                  className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Mark completed
                </button>
              ) : null}
            </div>
          ))}
          {dashboard.todayBookings.length === 0 ? <p className="text-sm text-slate-600">No bookings scheduled for today.</p> : null}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Slot management</h2>

        <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-4">
          <input
            type="date"
            value={slotDraft.date}
            onChange={(event) => setSlotDraft((current) => ({ ...current, date: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="time"
            value={slotDraft.startTime}
            onChange={(event) => setSlotDraft((current) => ({ ...current, startTime: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="time"
            value={slotDraft.endTime}
            onChange={(event) => setSlotDraft((current) => ({ ...current, endTime: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void handleCreateSlot()}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add slot
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {dashboard.slots.map((slot) => (
            <div key={slot.id} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-6">
              <input
                type="date"
                value={slotEditDrafts[slot.id]?.date ?? slot.date}
                onChange={(event) =>
                  setSlotEditDrafts((current) => ({
                    ...current,
                    [slot.id]: {
                      date: event.target.value,
                      startTime: current[slot.id]?.startTime ?? slot.start_time,
                      endTime: current[slot.id]?.endTime ?? slot.end_time,
                    },
                  }))
                }
                className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
              <input
                type="time"
                value={slotEditDrafts[slot.id]?.startTime ?? slot.start_time}
                onChange={(event) =>
                  setSlotEditDrafts((current) => ({
                    ...current,
                    [slot.id]: {
                      date: current[slot.id]?.date ?? slot.date,
                      startTime: event.target.value,
                      endTime: current[slot.id]?.endTime ?? slot.end_time,
                    },
                  }))
                }
                className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
              <input
                type="time"
                value={slotEditDrafts[slot.id]?.endTime ?? slot.end_time}
                onChange={(event) =>
                  setSlotEditDrafts((current) => ({
                    ...current,
                    [slot.id]: {
                      date: current[slot.id]?.date ?? slot.date,
                      startTime: current[slot.id]?.startTime ?? slot.start_time,
                      endTime: event.target.value,
                    },
                  }))
                }
                className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
              <div className="flex items-center">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${slot.is_booked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {slot.is_booked ? 'Booked' : 'Open'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleSaveSlot(slot)}
                className="rounded-lg border border-slate-300 px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteSlot(slot)}
                disabled={slot.is_booked}
                className="rounded-lg border border-red-300 px-2 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
          {dashboard.slots.length === 0 ? <p className="text-sm text-slate-600">No slots yet. Add your first availability slot above.</p> : null}
        </div>
      </article>
    </section>
  )
}
