import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import styles from './ErrorState.module.css'

interface ErrorStateProps {
  title?: string
  description: string
  /** Botón de reintentar o enlace para volver. */
  action?: ReactNode
}

export function ErrorState({
  title = 'Algo salió mal',
  description,
  action,
}: ErrorStateProps) {
  return (
    <section className={styles.error} role="alert">
      <div className={styles.icon} aria-hidden="true">
        <TriangleAlert size={40} />
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action}
    </section>
  )
}