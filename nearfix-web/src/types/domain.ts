import type { ServiceCategory } from '../lib/categories'

export const BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export type UserRole = 'customer' | 'worker' | 'admin'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
  is_active: boolean
}

export interface WorkerProfile {
  id: string
  user_id: string
  category: ServiceCategory
  experience: number
  bio: string | null
  starting_price: number
  service_area: string
  verified: boolean
  rating: number
  jobs_completed: number
  created_at: string
}

export interface AvailabilitySlot {
  id: string
  worker_id: string
  slot_date: string
  slot_start: string
  slot_end: string
  is_booked: boolean
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string
  worker_id: string
  slot_id: string
  issue_description: string
  status: BookingStatus
  scheduled_at: string
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  customer_id: string
  worker_id: string
  rating: number
  text: string | null
  punctuality: number
  work_quality: number
  behavior: number
  created_at: string
}
