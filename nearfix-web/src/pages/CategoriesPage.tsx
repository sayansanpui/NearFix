import { PageCard } from '../components/PageCard'
import { SERVICE_CATEGORIES } from '../lib/categories'

export function CategoriesPage() {
  return (
    <section className="space-y-6">
      <PageCard title="Categories" description="NearFix service categories (shared constants from one source of truth)." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_CATEGORIES.map((category) => (
          <article key={category} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-medium text-slate-900">{category}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
