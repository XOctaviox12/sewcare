import { Construction } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import type { Breadcrumb } from '../components/PageHeader'

interface PlaceholderPageProps {
  title: string
  /** Sección del plan en la que se construye esta pantalla. */
  section: number
  breadcrumbs?: Breadcrumb[]
}

export function PlaceholderPage({ title, section, breadcrumbs }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />
      <EmptyState
        icon={<Construction size={40} />}
        title="Pantalla en construcción"
        description={`Esta pantalla se construye en la Sección ${section} del plan de desarrollo.`}
      />
    </>
  )
}