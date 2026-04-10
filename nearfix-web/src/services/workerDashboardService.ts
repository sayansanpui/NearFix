import { supabase } from '../lib/supabase'
import type { BookingStatus } from '../types'

export type WorkerDashboardBooking = {
  id: string
  customer_id: string
  worker_id: string
  slot_id: string
  description: string
  status: BookingStatus
  price: number
  created_at: string
  updated_at: string
  customer_name: string
  slot_date: string
  slot_start_time: string
  slot_end_time: string
}

export type WorkerManagedSlot = {
  id: string
  worker_id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
}

export type WorkerDashboardData = {
  workerId: string
  workerName: string
  rating: number
  jobsCompleted: number
  todayBookings: WorkerDashboardBooking[]
  pendingRequests: WorkerDashboardBooking[]
  completedBookings: WorkerDashboardBooking[]
  allBookings: WorkerDashboardBooking[]
  earningsMock: number
  slots: WorkerManagedSlot[]
}

export async function getWorkerIdForUser(userProfileId: string) {
  const { data, error } = await supabase.from('workers').select('id, user_id').eq('user_id', userProfileId).single()

  if (error || !data) {
    throw error ?? new Error('Worker profile was not found for this account.')
  }

  return data.id as string
}

async function getWorkerName(workerUserId: string) {
  const { data } = await supabase.from('users').select('id, name').eq('id', workerUserId).maybeSingle()
  return (data?.name as string) ?? 'NearFix Worker'
}

async function mapWorkerBookings(workerId: string): Promise<WorkerDashboardBooking[]> {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, customer_id, worker_id, slot_id, description, status, price, created_at, updated_at')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false })

  if (error || !bookings) {
    throw error ?? new Error('Unable to load worker bookings.')
  }

  const customerIds = [...new Set(bookings.map((booking) => booking.customer_id as string))]
  const slotIds = [...new Set(bookings.map((booking) => booking.slot_id as string))]

  const [customersResult, slotsResult] = await Promise.all([
    supabase.from('users').select('id, name').in('id', customerIds),
    supabase.from('availability_slots').select('id, date, start_time, end_time').in('id', slotIds),
  ])

  if (customersResult.error) {
    throw customersResult.error
  }
  if (slotsResult.error) {
    throw slotsResult.error
  }

  const customerMap = new Map((customersResult.data ?? []).map((customer) => [customer.id as string, customer.name as string]))
  const slotMap = new Map((slotsResult.data ?? []).map((slot) => [slot.id as string, slot]))

  return bookings.map((booking) => {
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
      customer_name: customerMap.get(booking.customer_id as string) ?? 'Customer',
      slot_date: (slot?.date as string) ?? '-',
      slot_start_time: (slot?.start_time as string) ?? '-',
      slot_end_time: (slot?.end_time as string) ?? '-',
    }
  })
}

async function getWorkerSlots(workerId: string): Promise<WorkerManagedSlot[]> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('id, worker_id, date, start_time, end_time, is_booked')
    .eq('worker_id', workerId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error || !data) {
    throw error ?? new Error('Unable to load worker slots.')
  }

  return data.map((slot) => ({
    id: slot.id as string,
    worker_id: slot.worker_id as string,
    date: slot.date as string,
    start_time: slot.start_time as string,
    end_time: slot.end_time as string,
    is_booked: Boolean(slot.is_booked),
  }))
}

export async function getWorkerDashboardData(userProfileId: string): Promise<WorkerDashboardData> {
  const { data: workerRow, error: workerError } = await supabase
    .from('workers')
    .select('id, user_id, rating, jobs_completed')
    .eq('user_id', userProfileId)
    .single()

  if (workerError || !workerRow) {
    throw workerError ?? new Error('Worker profile not found.')
  }

  const workerId = workerRow.id as string
  const [workerName, allBookings, slots] = await Promise.all([
    getWorkerName(workerRow.user_id as string),
    mapWorkerBookings(workerId),
    getWorkerSlots(workerId),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const todayBookings = allBookings.filter((booking) => booking.slot_date === today)
  const pendingRequests = allBookings.filter((booking) => booking.status === 'PENDING')
  const completedBookings = allBookings.filter((booking) => booking.status === 'COMPLETED')

  const earningsMock = completedBookings.reduce((sum, booking) => sum + booking.price, 0)

  return {
    workerId,
    workerName,
    rating: Number(workerRow.rating ?? 0),
    jobsCompleted: Number(workerRow.jobs_completed ?? 0),
    todayBookings,
    pendingRequests,
    completedBookings,
    allBookings,
    earningsMock,
    slots,
  }
}

export async function updateBookingStatusForWorker(payload: {
  bookingId: string
  workerId: string
  nextStatus: 'CONFIRMED' | 'REJECTED' | 'COMPLETED'
}) {
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, status, slot_id, worker_id')
    .eq('id', payload.bookingId)
    .eq('worker_id', payload.workerId)
    .single()

  if (fetchError || !booking) {
    throw fetchError ?? new Error('Booking not found.')
  }

  const currentStatus = booking.status as BookingStatus

  if (payload.nextStatus === 'CONFIRMED' && currentStatus !== 'PENDING') {
    throw new Error('Only pending bookings can be confirmed.')
  }
  if (payload.nextStatus === 'REJECTED' && currentStatus !== 'PENDING') {
    throw new Error('Only pending bookings can be rejected.')
  }
  if (payload.nextStatus === 'COMPLETED' && currentStatus !== 'CONFIRMED') {
    throw new Error('Only confirmed bookings can be completed.')
  }

  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ status: payload.nextStatus })
    .eq('id', payload.bookingId)
    .eq('worker_id', payload.workerId)

  if (bookingError) {
    throw bookingError
  }

  if (payload.nextStatus === 'REJECTED') {
    const { error: slotError } = await supabase
      .from('availability_slots')
      .update({ is_booked: false })
      .eq('id', booking.slot_id as string)

    if (slotError) {
      throw slotError
    }
  }
}

export async function createWorkerSlot(payload: {
  workerId: string
  date: string
  startTime: string
  endTime: string
}) {
  const { error } = await supabase.from('availability_slots').insert({
    worker_id: payload.workerId,
    date: payload.date,
    start_time: payload.startTime,
    end_time: payload.endTime,
    is_booked: false,
  })

  if (error) {
    throw error
  }
}

export async function updateWorkerSlot(payload: {
  slotId: string
  workerId: string
  date: string
  startTime: string
  endTime: string
}) {
  const { error } = await supabase
    .from('availability_slots')
    .update({
      date: payload.date,
      start_time: payload.startTime,
      end_time: payload.endTime,
    })
    .eq('id', payload.slotId)
    .eq('worker_id', payload.workerId)

  if (error) {
    throw error
  }
}

export async function deleteWorkerSlot(payload: { slotId: string; workerId: string }) {
  const { error } = await supabase
    .from('availability_slots')
    .delete()
    .eq('id', payload.slotId)
    .eq('worker_id', payload.workerId)
    .eq('is_booked', false)

  if (error) {
    throw error
  }
}
