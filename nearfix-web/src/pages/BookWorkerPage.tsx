import { useParams } from 'react-router-dom'
import { PageCard } from '../components/PageCard'

export function BookWorkerPage() {
  const { workerId } = useParams<{ workerId: string }>()

  return (
    <PageCard
      title="Book Worker"
      description={`Booking flow placeholder for workerId: ${workerId ?? 'unknown'}. Multi-step booking UI will be added in Step 6.`}
    />
  )
}
