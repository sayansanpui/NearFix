import { PageCard } from '../components/PageCard'

export function WorkersPage() {
  return (
    <PageCard
      title="Workers"
      description="Worker listing route placeholder. Sorting/filtering and live data wiring will be added in Step 6."
      links={[{ to: '/workers/sample-worker-id', label: 'Open sample worker profile route' }]}
    />
  )
}
