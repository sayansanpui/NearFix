export const SERVICE_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'AC Repair',
  'RO Repair',
  'Home Cleaning',
  'Painter',
  'Appliance Repair',
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]
