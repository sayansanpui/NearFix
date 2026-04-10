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
  auth_user_id: string | null
  name: string
  email: string
  role: UserRole
  created_at: string
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
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string
  worker_id: string
  slot_id: string
  description: string
  status: BookingStatus
  price: number
  created_at: string
  updated_at: string
}

export interface Review {
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
}
