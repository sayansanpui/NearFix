import { Link } from 'react-router-dom'

interface PageCardProps {
  title: string
  description: string
  links?: Array<{ to: string; label: string }>
}

export function PageCard({ title, description, links = [] }: PageCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>

      {links.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  )
}
