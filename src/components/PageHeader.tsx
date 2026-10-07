import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './PageHeader.module.css'

export interface Breadcrumb {
  label: string
  /** Sin "to" = texto simple (el último elemento nunca es enlace). */
  to?: string
}

interface PageHeaderProps {
  title: string
  breadcrumbs?: Breadcrumb[]
  /** Botones de acción a la derecha (solo los que ya funcionan). */
  actions?: ReactNode
}

export function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Ruta de navegación">
          <ol className={styles.crumbs}>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <li key={`${crumb.label}-${index}`} className={styles.crumb}>
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={isLast ? 'page' : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}
      <div className={styles.row}>
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  )
}