import { Link } from 'react-router-dom'
import { SERVICE_CATEGORIES } from '../lib/categories'

const categoryIcons: Record<string, string> = {
  Electrician: '⚡',
  Plumber: '🔧',
  Carpenter: '🪚',
  'AC Repair': '❄️',
  'RO Repair': '💧',
  'Home Cleaning': '🧼',
  Painter: '🎨',
  'Appliance Repair': '🛠️',
}

export function CategoriesPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Categories</h1>
        <p className="mt-2 text-slate-600">Choose a service category to view available workers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICE_CATEGORIES.map((category) => (
          <Link
            key={category}
            to={`/workers?category=${encodeURIComponent(category)}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <p className="text-3xl">{categoryIcons[category] ?? '🔹'}</p>
            <p className="mt-3 font-semibold text-slate-900">{category}</p>
            <p className="mt-1 text-sm text-slate-500 group-hover:text-slate-700">View workers</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
