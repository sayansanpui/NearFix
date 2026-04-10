import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WorkerCard } from '../components/WorkerCard'
import { SERVICE_CATEGORIES } from '../lib/categories'
import { getWorkers, type WorkerSummary } from '../services/customerFlowService'

type SortOption = 'highest-rated' | 'lowest-price' | 'most-experienced'

export function WorkersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [workers, setWorkers] = useState<WorkerSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categoryFilter = searchParams.get('category') ?? ''
  const sortBy = (searchParams.get('sort') as SortOption | null) ?? 'highest-rated'

  useEffect(() => {
    async function loadWorkers() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getWorkers({
          sortBy,
          category: categoryFilter || undefined,
        })
        setWorkers(data)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load workers.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadWorkers()
  }, [sortBy, categoryFilter])

  const sortOptions = useMemo(
    () => [
      { value: 'highest-rated', label: 'Highest rated' },
      { value: 'lowest-price', label: 'Lowest price' },
      { value: 'most-experienced', label: 'Most experienced' },
    ] as const,
    [],
  )

  function updateSort(nextSort: SortOption) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('sort', nextSort)
    setSearchParams(nextParams)
  }

  function updateCategory(nextCategory: string) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextCategory) {
      nextParams.set('category', nextCategory)
    } else {
      nextParams.delete('category')
    }
    setSearchParams(nextParams)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Workers</h1>
          <p className="mt-2 text-slate-600">Compare verified professionals and book available slots.</p>
        </div>

        <label className="text-sm font-medium text-slate-700">
          Sort by
          <select
            value={sortBy}
            onChange={(event) => updateSort(event.target.value as SortOption)}
            className="ml-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateCategory('')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !categoryFilter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        {SERVICE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => updateCategory(category)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              categoryFilter === category ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? <p className="text-sm text-slate-600">Loading workers...</p> : null}
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {!isLoading && !error ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      ) : null}

      {!isLoading && !error && workers.length === 0 ? <p className="text-sm text-slate-600">No workers available for this category.</p> : null}
    </section>
  )
}
