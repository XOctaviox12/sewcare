import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { ROUTES } from '../constants/routes'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Página no encontrada" />
      <EmptyState
        icon={<SearchX size={40} />}
        title="No encontramos esa página"
        description="La dirección no existe o fue cambiada. Regresa al inicio para continuar."
        action={<Link to={ROUTES.home()}>Ir al inicio</Link>}
      />
    </>
  )
}