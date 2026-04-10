import { useEffect, useMemo, useState } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import {
  getAdminDashboardData,
  removeReview,
  toggleUserActive,
  toggleWorkerVerification,
  type AdminDashboardData,
  type AdminReviewRow,
  type AdminUserRow,
  type AdminWorkerRow,
} from '../services/adminDashboardService'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMutating, setIsMutating] = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getAdminDashboardData()
        setDashboard(data)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load admin dashboard.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const summary = useMemo(
    () => ({
      users: dashboard?.users.length ?? 0,
      workers: dashboard?.workers.length ?? 0,
      bookings: dashboard?.bookings.length ?? 0,
      reviews: dashboard?.reviews.length ?? 0,
    }),
    [dashboard],
  )

  async function refreshDashboard() {
    const data = await getAdminDashboardData()
    setDashboard(data)
  }

  async function handleToggleWorker(worker: AdminWorkerRow) {
    setIsMutating(true)
    setError(null)

    try {
      await toggleWorkerVerification({
        workerId: worker.id,
        verified: !worker.verified,
      })
      await refreshDashboard()
    } catch (toggleError) {
      const message = toggleError instanceof Error ? toggleError.message : 'Unable to update worker verification.'
      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  async function handleToggleUser(user: AdminUserRow) {
    setIsMutating(true)
    setError(null)

    try {
      await toggleUserActive({
        userId: user.id,
        isActive: !user.is_active,
      })
      await refreshDashboard()
    } catch (toggleError) {
      const message = toggleError instanceof Error ? toggleError.message : 'Unable to update user status.'
      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  async function handleRemoveReview(review: AdminReviewRow) {
    setIsMutating(true)
    setError(null)

    try {
      await removeReview({ reviewId: review.id })
      await refreshDashboard()
    } catch (removeError) {
      const message = removeError instanceof Error ? removeError.message : 'Unable to moderate review.'
      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading admin dashboard...</p>
  }

  if (!dashboard) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error ?? 'Admin dashboard data is unavailable.'}</p>
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-slate-600">Moderate users, verify workers, inspect bookings, and manage reviews.</p>
        </div>
        {isMutating ? <p className="text-sm text-slate-500">Applying admin action...</p> : null}
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Users</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.users}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Workers</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.workers}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Bookings</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.bookings}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Reviews</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.reviews}</p>
        </article>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Users table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-700">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    {user.role !== 'admin' ? (
                      <button
                        type="button"
                        onClick={() => void handleToggleUser(user)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Workers table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.workers.map((worker) => (
                <tr key={worker.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{worker.worker_name}</td>
                  <td className="px-4 py-3 text-slate-700">{worker.category}</td>
                  <td className="px-4 py-3 text-slate-700">{worker.experience} yrs</td>
                  <td className="px-4 py-3 text-slate-700">{worker.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${worker.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {worker.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void handleToggleWorker(worker)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {worker.verified ? 'Remove verification' : 'Approve verification'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Bookings table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{booking.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-slate-700">{booking.customer_name}</td>
                  <td className="px-4 py-3 text-slate-700">{booking.worker_name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">INR {booking.price.toFixed(0)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(booking.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Review moderation</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.reviews.map((review) => (
                <tr key={review.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{review.worker_name}</td>
                  <td className="px-4 py-3 text-slate-700">{review.customer_name}</td>
                  <td className="px-4 py-3 text-slate-700">{review.rating}</td>
                  <td className="max-w-lg px-4 py-3 text-slate-700">{review.review || 'No text'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(review.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void handleRemoveReview(review)}
                      className="rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
