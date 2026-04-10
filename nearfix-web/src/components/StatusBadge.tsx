import clsx from 'clsx'
import type { BookingStatus } from '../types'

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-slate-200 text-slate-700 border-slate-300',
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={clsx('rounded-full border px-2.5 py-1 text-xs font-semibold', statusStyles[status])}>{status}</span>
}
