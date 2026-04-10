import { supabase } from '../lib/supabase'
import type { ServiceCategory } from '../lib/categories'
import type { BookingStatus, UserProfile } from '../types'

export type WorkerSummary = {
  id: string
  user_id: string
  name: string
  category: ServiceCategory
  experience: number
  bio: string
  starting_price: number
  service_area: string
  verified: boolean
  rating: number
  jobs_completed: number
  available_today: number
  avatar_url: string
}

export type WorkerDetails = WorkerSummary & {
  slots: WorkerSlot[]
  reviews: WorkerReview[]
  average_rating: number
}

export type WorkerSlot = {
  id: string
  worker_id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
}

export type WorkerReview = {
  id: string
  booking_id: string
  customer_id: string
  worker_id: string
  rating: number
  review: string
  punctuality: number
  work_quality: number
  behavior: number
  created_at: string
  customer_name: string
}

export type BookingWithWorker = {
  id: string
  customer_id: string
  worker_id: string
  slot_id: string
  description: string
  status: BookingStatus
  price: number
  created_at: string
  updated_at: string
  worker_name: string
  worker_category: string
  worker_service_area: string
  slot_date: string
  slot_start_time: string
  slot_end_time: string
}

const WORKER_SELECT = 'id, user_id, category, experience, bio, starting_price, service_area, verified, rating, jobs_completed, created_at'

function avatarFromName(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=ffffff`
}

async function fetchWorkerNames(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, string>()
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, name, role')
    .in('id', userIds)
    .eq('role', 'worker')

  if (error || !data) {
    return new Map<string, string>()
  }

  return new Map(data.map((row) => [row.id as string, row.name as string]))
}

async function fetchAvailableTodayCount(workerIds: string[]) {
  if (workerIds.length === 0) {
    return new Map<string, number>()
  }

  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('availability_slots')
    .select('worker_id, is_booked, date')
    .in('worker_id', workerIds)
    .eq('date', today)
    .eq('is_booked', false)

  if (error || !data) {
    return new Map<string, number>()
  }

  const counts = new Map<string, number>()
  data.forEach((row) => {
    const workerId = row.worker_id as string
    counts.set(workerId, (counts.get(workerId) ?? 0) + 1)
  })

  return counts
}

export async function getTopRatedWorkers(limit = 4): Promise<WorkerSummary[]> {
  const { data, error } = await supabase
    .from('workers')
    .select(WORKER_SELECT)
    .order('rating', { ascending: false })
    .order('jobs_completed', { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  const workerIds = data.map((worker) => worker.id as string)
  const workerUserIds = data.map((worker) => worker.user_id as string)
  const [nameMap, availabilityMap] = await Promise.all([
    fetchWorkerNames(workerUserIds),
    fetchAvailableTodayCount(workerIds),
  ])

  return data.map((worker) => {
    const name = nameMap.get(worker.user_id as string) ?? 'NearFix Pro'
    return {
      id: worker.id as string,
      user_id: worker.user_id as string,
      name,
      category: worker.category as ServiceCategory,
      experience: Number(worker.experience ?? 0),
      bio: (worker.bio as string) ?? '',
      starting_price: Number(worker.starting_price ?? 0),
      service_area: (worker.service_area as string) ?? '',
      verified: Boolean(worker.verified),
      rating: Number(worker.rating ?? 0),
      jobs_completed: Number(worker.jobs_completed ?? 0),
      available_today: availabilityMap.get(worker.id as string) ?? 0,
      avatar_url: avatarFromName(name),
    }
  })
}

export async function getWorkers(options: { sortBy: 'highest-rated' | 'lowest-price' | 'most-experienced'; category?: string }) {
  let query = supabase.from('workers').select(WORKER_SELECT)

  if (options.category) {
    query = query.eq('category', options.category)
  }

  if (options.sortBy === 'highest-rated') {
    query = query.order('rating', { ascending: false }).order('jobs_completed', { ascending: false })
  }
  if (options.sortBy === 'lowest-price') {
    query = query.order('starting_price', { ascending: true })
  }
  if (options.sortBy === 'most-experienced') {
    query = query.order('experience', { ascending: false })
  }

  const { data, error } = await query

  if (error || !data) {
    throw error ?? new Error('Failed to load workers.')
  }

  const workerIds = data.map((worker) => worker.id as string)
  const workerUserIds = data.map((worker) => worker.user_id as string)
  const [nameMap, availabilityMap] = await Promise.all([
    fetchWorkerNames(workerUserIds),
    fetchAvailableTodayCount(workerIds),
  ])

  return data.map((worker) => {
    const name = nameMap.get(worker.user_id as string) ?? 'NearFix Pro'

    return {
      id: worker.id as string,
      user_id: worker.user_id as string,
      name,
      category: worker.category as ServiceCategory,
      experience: Number(worker.experience ?? 0),
      bio: (worker.bio as string) ?? '',
      starting_price: Number(worker.starting_price ?? 0),
      service_area: (worker.service_area as string) ?? '',
      verified: Boolean(worker.verified),
      rating: Number(worker.rating ?? 0),
      jobs_completed: Number(worker.jobs_completed ?? 0),
      available_today: availabilityMap.get(worker.id as string) ?? 0,
      avatar_url: avatarFromName(name),
    } satisfies WorkerSummary
  })
}

export async function getWorkerDetails(workerId: string): Promise<WorkerDetails> {
  const { data: worker, error: workerError } = await supabase.from('workers').select(WORKER_SELECT).eq('id', workerId).single()

  if (workerError || !worker) {
    throw workerError ?? new Error('Worker not found.')
  }

  const [nameMap, slotsResult, reviewsResult] = await Promise.all([
    fetchWorkerNames([worker.user_id as string]),
    supabase
      .from('availability_slots')
      .select('id, worker_id, date, start_time, end_time, is_booked')
      .eq('worker_id', workerId)
      .gte('date', new Date().toISOString().slice(0, 10))
      .order('date', { ascending: true })
      .order('start_time', { ascending: true }),
    supabase.from('reviews').select('id, booking_id, customer_id, worker_id, rating, review, punctuality, work_quality, behavior, created_at').eq('worker_id', workerId).order('created_at', { ascending: false }),
  ])

  if (slotsResult.error) {
    throw slotsResult.error
  }
  if (reviewsResult.error) {
    throw reviewsResult.error
  }

  const reviews = reviewsResult.data ?? []
  const customerIds = [...new Set(reviews.map((review) => review.customer_id as string))]
  const { data: customerRows } = await supabase.from('users').select('id, name').in('id', customerIds)
  const customerMap = new Map((customerRows ?? []).map((row) => [row.id as string, row.name as string]))

  const mappedReviews: WorkerReview[] = reviews.map((review) => ({
    id: review.id as string,
    booking_id: review.booking_id as string,
    customer_id: review.customer_id as string,
    worker_id: review.worker_id as string,
    rating: Number(review.rating ?? 0),
    review: (review.review as string) ?? '',
    punctuality: Number(review.punctuality ?? 0),
    work_quality: Number(review.work_quality ?? 0),
    behavior: Number(review.behavior ?? 0),
    created_at: review.created_at as string,
    customer_name: customerMap.get(review.customer_id as string) ?? 'Customer',
  }))

  const averageRating =
    mappedReviews.length > 0
      ? mappedReviews.reduce((sum, review) => sum + review.rating, 0) / mappedReviews.length
      : Number(worker.rating ?? 0)

  const name = nameMap.get(worker.user_id as string) ?? 'NearFix Pro'

  return {
    id: worker.id as string,
    user_id: worker.user_id as string,
    name,
    category: worker.category as ServiceCategory,
    experience: Number(worker.experience ?? 0),
    bio: (worker.bio as string) ?? '',
    starting_price: Number(worker.starting_price ?? 0),
    service_area: (worker.service_area as string) ?? '',
    verified: Boolean(worker.verified),
    rating: Number(worker.rating ?? 0),
    jobs_completed: Number(worker.jobs_completed ?? 0),
    available_today: (slotsResult.data ?? []).filter((slot) => !slot.is_booked).length,
    avatar_url: avatarFromName(name),
    slots: (slotsResult.data ?? []).map((slot) => ({
      id: slot.id as string,
      worker_id: slot.worker_id as string,
      date: slot.date as string,
      start_time: slot.start_time as string,
      end_time: slot.end_time as string,
      is_booked: Boolean(slot.is_booked),
    })),
    reviews: mappedReviews,
    average_rating: averageRating,
  }
}

export async function createBooking(payload: {
  customerProfile: UserProfile
  workerId: string
  slotId: string
  description: string
  price: number
}) {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_id: payload.customerProfile.id,
      worker_id: payload.workerId,
      slot_id: payload.slotId,
      description: payload.description,
      status: 'PENDING',
      price: payload.price,
    })
    .select('id')
    .single()

  if (bookingError || !booking) {
    throw bookingError ?? new Error('Unable to create booking.')
  }

  const { error: slotError } = await supabase.from('availability_slots').update({ is_booked: true }).eq('id', payload.slotId)

  if (slotError) {
    throw slotError
  }

  return booking.id as string
}

export async function getMyBookings(customerProfileId: string): Promise<BookingWithWorker[]> {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, customer_id, worker_id, slot_id, description, status, price, created_at, updated_at')
    .eq('customer_id', customerProfileId)
    .order('created_at', { ascending: false })

  if (error || !bookings) {
    throw error ?? new Error('Unable to load bookings.')
  }

  const workerIds = [...new Set(bookings.map((booking) => booking.worker_id as string))]
  const slotIds = [...new Set(bookings.map((booking) => booking.slot_id as string))]

  const [workersResult, slotsResult, workerUsersResult] = await Promise.all([
    supabase.from('workers').select('id, user_id, category, service_area').in('id', workerIds),
    supabase.from('availability_slots').select('id, date, start_time, end_time').in('id', slotIds),
    supabase.from('workers').select('id, user_id').in('id', workerIds),
  ])

  if (workersResult.error) {
    throw workersResult.error
  }
  if (slotsResult.error) {
    throw slotsResult.error
  }
  if (workerUsersResult.error) {
    throw workerUsersResult.error
  }

  const userIds = (workerUsersResult.data ?? []).map((row) => row.user_id as string)
  const { data: workerNamesRows } = await supabase.from('users').select('id, name').in('id', userIds)

  const workerNameMap = new Map((workerNamesRows ?? []).map((row) => [row.id as string, row.name as string]))
  const workerMap = new Map((workersResult.data ?? []).map((worker) => [worker.id as string, worker]))
  const slotMap = new Map((slotsResult.data ?? []).map((slot) => [slot.id as string, slot]))

  return bookings.map((booking) => {
    const worker = workerMap.get(booking.worker_id as string)
    const slot = slotMap.get(booking.slot_id as string)

    return {
      id: booking.id as string,
      customer_id: booking.customer_id as string,
      worker_id: booking.worker_id as string,
      slot_id: booking.slot_id as string,
      description: (booking.description as string) ?? '',
      status: booking.status as BookingStatus,
      price: Number(booking.price ?? 0),
      created_at: booking.created_at as string,
      updated_at: booking.updated_at as string,
      worker_name: workerNameMap.get((worker?.user_id as string) ?? '') ?? 'NearFix Pro',
      worker_category: (worker?.category as string) ?? 'Service',
      worker_service_area: (worker?.service_area as string) ?? '',
      slot_date: (slot?.date as string) ?? '-',
      slot_start_time: (slot?.start_time as string) ?? '-',
      slot_end_time: (slot?.end_time as string) ?? '-',
    }
  })
}

export async function cancelBooking(payload: { bookingId: string; slotId: string }) {
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ status: 'CANCELLED' })
    .eq('id', payload.bookingId)
    .in('status', ['PENDING', 'CONFIRMED'])

  if (bookingError) {
    throw bookingError
  }

  const { error: slotError } = await supabase.from('availability_slots').update({ is_booked: false }).eq('id', payload.slotId)

  if (slotError) {
    throw slotError
  }
}

export async function createReview(payload: {
  bookingId: string
  workerId: string
  customerId: string
  rating: number
  review: string
  punctuality: number
  work_quality: number
  behavior: number
}) {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', payload.bookingId)
    .single()

  if (bookingError || !booking) {
    throw bookingError ?? new Error('Booking not found.')
  }

  if ((booking.status as BookingStatus) !== 'COMPLETED') {
    throw new Error('Review can only be submitted for completed bookings.')
  }

  const { error } = await supabase.from('reviews').insert(payload)

  if (error) {
    throw error
  }
}
