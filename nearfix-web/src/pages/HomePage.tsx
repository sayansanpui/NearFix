import { PageCard } from '../components/PageCard'

export function HomePage() {
  return (
    <PageCard
      title="NearFix MVP"
      description="App foundation is ready. Use this route skeleton as the base for feature implementation in upcoming steps."
      links={[
        { to: '/categories', label: 'Browse categories' },
        { to: '/workers', label: 'Find workers' },
      ]}
    />
  )
}
