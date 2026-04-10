import { supabase } from '../lib/supabase'
import type { BookingStatus, UserRole } from '../types'

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export type AdminWorkerRow = {
  id: string
  user_id: string
  worker_name: string
  category: string
  experience: number
  verified: boolean
  rating: number
  jobs_completed: number
  service_area: string
}

export type AdminBookingRow = {
  id: string
  customer_name: string
  worker_name: string
  status: BookingStatus
  price: number
  created_at: string
}

export type AdminReviewRow = {
  id: string
  worker_name: string
  customer_name: string
  rating: number
  review: string
  created_at: string
}

export type AdminDashboardData = {
  users: AdminUserRow[]
  workers: AdminWorkerRow[]
  bookings: AdminBookingRow[]
  reviews: AdminReviewRow[]
}

async function buildUserNameMap() {
  const { data, error } = await supabase.from('users').select('id, name')

  if (error || !data) {
    throw error ?? new Error('Unable to load user names.')
  }

  return new Map(data.map((user) => [user.id as string, user.name as string]))
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [usersResult, workersResult, bookingsResult, reviewsResult, userNameMap] = await Promise.all([
    supabase.from('users').select('id, name, email, role, is_active, created_at').order('created_at', { ascending: false }),
    supabase
      .from('workers')
      .select('id, user_id, category, experience, verified, rating, jobs_completed, service_area')
      .order('created_at', { ascending: false }),
    supabase.from('bookings').select('id, customer_id, worker_id, status, price, created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('reviews').select('id, worker_id, customer_id, rating, review, created_at').order('created_at', { ascending: false }).limit(100),
    buildUserNameMap(),
  ])

  if (usersResult.error) {
    throw usersResult.error
  }
  if (workersResult.error) {
    throw workersResult.error
  }
  if (bookingsResult.error) {
    throw bookingsResult.error
  }
  if (reviewsResult.error) {
    throw reviewsResult.error
  }

  const workers = (workersResult.data ?? []).map((worker) => ({
    id: worker.id as string,
    user_id: worker.user_id as string,
    worker_name: userNameMap.get(worker.user_id as string) ?? 'Worker',
    category: (worker.category as string) ?? '-',
    experience: Number(worker.experience ?? 0),
    verified: Boolean(worker.verified),
    rating: Number(worker.rating ?? 0),
    jobs_completed: Number(worker.jobs_completed ?? 0),
    service_area: (worker.service_area as string) ?? '-',
  }))

  const workerNameByWorkerId = new Map(workers.map((worker) => [worker.id, worker.worker_name]))

  const users = (usersResult.data ?? []).map((user) => ({
    id: user.id as string,
    name: user.name as string,
    email: user.email as string,
    role: user.role as UserRole,
    is_active: Boolean(user.is_active ?? true),
    created_at: user.created_at as string,
  }))

  const bookings = (bookingsResult.data ?? []).map((booking) => ({
    id: booking.id as string,
    customer_name: userNameMap.get(booking.customer_id as string) ?? 'Customer',
    worker_name: workerNameByWorkerId.get(booking.worker_id as string) ?? 'Worker',
    status: booking.status as BookingStatus,
    price: Number(booking.price ?? 0),
    created_at: booking.created_at as string,
  }))

  const reviews = (reviewsResult.data ?? []).map((review) => ({
    id: review.id as string,
    worker_name: workerNameByWorkerId.get(review.worker_id as string) ?? 'Worker',
    customer_name: userNameMap.get(review.customer_id as string) ?? 'Customer',
    rating: Number(review.rating ?? 0),
    review: (review.review as string) ?? '',
    created_at: review.created_at as string,
  }))

  return {
    users,
    workers,
    bookings,
    reviews,
  }
}

export async function toggleWorkerVerification(payload: { workerId: string; verified: boolean }) {
  const { error } = await supabase.from('workers').update({ verified: payload.verified }).eq('id', payload.workerId)
  if (error) {
    throw error
  }
}

export async function toggleUserActive(payload: { userId: string; isActive: boolean }) {
  const { error } = await supabase.from('users').update({ is_active: payload.isActive }).eq('id', payload.userId)
  if (error) {
    throw error
  }
}

export async function removeReview(payload: { reviewId: string }) {
  const { error } = await supabase.from('reviews').delete().eq('id', payload.reviewId)
  if (error) {
    throw error
  }
}
