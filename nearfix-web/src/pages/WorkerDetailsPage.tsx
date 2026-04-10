import { useParams } from 'react-router-dom'
import { PageCard } from '../components/PageCard'

export function WorkerDetailsPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <PageCard
      title="Worker Profile"
      description={`Worker details placeholder for id: ${id ?? 'unknown'}. Live profile view comes in Step 6.`}
      links={id ? [{ to: `/book/${id}`, label: 'Book this worker' }] : []}
    />
  )
}
